-- MedFlow Clinical Equipment Command Center - Business Data Seed
-- Seeds hospitals, technicians, equipment, work_orders, and service_reports.
-- Run AFTER create_tables.py has created the schema.
-- Run BEFORE the Python user-seeding script, since users.technician_id
-- references technicians.id.
--
-- psql -U postgres -d medflow
-- \i seed.sql
--
-- Data is deliberately shaped to exercise every business question in the
-- problem statement:
--   - Hospital 1 and 3 exceed the 30% maintenance threshold; Hospital 2 does not.
--   - Equipment 4 (Hospital 1) and Equipment 6 (Hospital 2) are below 20% charge.
--   - Work orders 3 and 7 assign a technician to equipment outside their
--     home facility (co-location discrepancies).
--   - Ventilator V2 and Imaging Cart X200 each have multiple work orders
--     with mixed Completed/Failed outcomes for the reliability ratio query.
--   - Hospitals 1 and 2 share supervisor_id 501, so a "technicians under
--     Supervisor 501" query returns technicians from two different sites.

-- Hospitals
INSERT INTO hospitals (id, name, location_region, capacity, supervisor_id) VALUES
    (1, 'Atlanta Regional Medical Center', 'US-East', 50, 501),
    (2, 'Denver Metro Hospital', 'US-West', 35, 501),
    (3, 'Miami Coastal Clinic', 'US-East', 20, 502);

-- Technicians
INSERT INTO technicians (id, name, facility_id) VALUES
    (1, 'R. Alvarez', 1),
    (2, 'S. Kim', 1),
    (3, 'T. Brooks', 2),
    (4, 'J. Nguyen', 3),
    (5, 'M. Patel', 1);

-- Equipment
INSERT INTO equipment (id, serial_number, model, status, charge_level, facility_id) VALUES
    (1, 100234, 'Infusion Pump X1', 'Available', 85.00, 1),
    (2, 100235, 'Ventilator V2', 'Maintenance', 45.00, 1),
    (3, 100236, 'Patient Monitor M3', 'Maintenance', 60.00, 1),
    (4, 100237, 'Infusion Pump X1', 'In-Use', 15.50, 1),
    (5, 100238, 'Imaging Cart X200', 'Available', 92.00, 1),
    (6, 200450, 'Ventilator V2', 'Available', 8.00, 2),
    (7, 200451, 'Patient Monitor M3', 'In-Use', 55.00, 2),
    (8, 200452, 'Infusion Pump X1', 'Available', 70.00, 2),
    (9, 300600, 'Imaging Cart X200', 'Offline', 0.00, 3),
    (10, 300601, 'Ventilator V2', 'Maintenance', 33.00, 3);

-- Work Orders
INSERT INTO work_orders (id, title, priority, status, equipment_id, technician_id) VALUES
    (1, 'Replace battery module', 'Critical', 'Completed', 2, 1),
    (2, 'Calibrate monitor', 'Medium', 'Completed', 3, 2),
    (3, 'Inspect imaging cart', 'Low', 'Failed', 9, 1),
    (4, 'Ventilator diagnostic', 'Critical', 'Failed', 10, 4),
    (5, 'Pump pressure check', 'Medium', 'Pending', 4, 5),
    (6, 'Monitor firmware update', 'Low', 'In-Progress', 7, 3),
    (7, 'Emergency ventilator repair', 'Critical', 'Completed', 6, 1),
    (8, 'Imaging cart offline check', 'Medium', 'Failed', 9, 4),
    (9, 'Pump maintenance check', 'Low', 'Completed', 1, 2),
    (10, 'Ventilator inspection', 'Medium', 'Completed', 2, 5);

-- Service Reports
INSERT INTO service_reports (work_order_id, file_url, notes) VALUES
    (1, 's3://medflow-reports/wo1-ventilator-battery.pdf', 'Battery replaced successfully, output voltage nominal.'),
    (3, 's3://medflow-reports/wo3-imaging-inspect.pdf', 'Imaging cart failed self-test, flagged for parts order.'),
    (4, 's3://medflow-reports/wo4-ventilator-diagnostic.pdf', 'Diagnostic failed, valve assembly needs replacement.'),
    (7, 's3://medflow-reports/wo7-ventilator-emergency.pdf', 'Emergency repair completed onsite within 2 hours.'),
    (8, 's3://medflow-reports/wo8-imaging-offline.pdf', 'Cart remains offline pending replacement part shipment.');

-- Reset sequences so subsequent app-created rows don't collide with these IDs
SELECT setval('hospitals_id_seq', (SELECT MAX(id) FROM hospitals));
SELECT setval('technicians_id_seq', (SELECT MAX(id) FROM technicians));
SELECT setval('equipment_id_seq', (SELECT MAX(id) FROM equipment));
SELECT setval('work_orders_id_seq', (SELECT MAX(id) FROM work_orders));
SELECT setval('service_reports_id_seq', (SELECT MAX(id) FROM service_reports));