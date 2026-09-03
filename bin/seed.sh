#! /usr/bin/env bash
# This file handles seeding our app data in the database or rds in the correct order
# (schema first, then business data, then user accounts)
# To run this file, we have 2 commands:
# bash bin/seed.sh local (this is the default if no argument is given)
# bash bin/seed.sh rds


# $1 is referring to the first argument after the script name
TARGET="${1:-local}"

# Answers question, which db are we seeding? 
if [ "$TARGET" == "local" ]; then
    ## TODO: Replace details in the db url below with YOUR details
    export DATABASE_URL= "postgresql+asyncpg://postgres:<password>@127.0.0.1:5432/medflow"
    PSQL_HOST= "127.0.0.1"
    PSQL_DB="medflow"
elif [ "$TARGET" == "rds" ]; then
    ## TODO: Replace details in the db url with YOUR REMOTE RDS details
    export DATABASE_URL= "postgresql+asyncpg://postgres:<password>@<your-rds-endpoint>:/5432/medflow"
    PSQL_HOST= "<your-rds-endpoint>"
    PSQL_DB= "medflow"
else
# Anything other than local or rds gets handled
    echo "Usage: bin/seed.sh [local|rds]"
    exit 1
fi

echo "Seeding target: $TARGET"

cd backend

# Step 1: creating the db tables
python -m scripts.create_tables

# Step 2: load the core business data
psql -h "$PSQL_HOST" -U postgres -d "$PSQL_DB" -f ../db/sql/seed.sql

# Step 3: load the RBAC demo users
python -m scripts.seed_users

echo "Seed complete for $TARGET"