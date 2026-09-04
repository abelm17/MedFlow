from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str= "postgres+asyncpg://postgres:password@127.0.0.1:5432/robopulse_dev"
    # No default value here because a wrong secret key value can cause the app to start up
    # seemingly successfully, but with a silent failure because it will pass an incorrect key
    # value for our JWT
    secret_key: str
    frontend_origin: str= "http://localhost:5173"

    # Tells pydantic-settings to actually read from backend/.env and fill these fields from it
    model_config= SettingsConfigDict(env_file=".env")

# Without the .env file setting values, this line will raise an error on startup
settings= Settings()