-- Initialize JobBlaster Database
-- This script sets up the basic database structure and initial data

-- Create database if it doesn't exist (handled by docker-entrypoint-initdb.d)
-- The database 'jobblaster' is already created by the POSTGRES_DB environment variable

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE jobblaster TO jobblaster;
GRANT ALL PRIVILEGES ON SCHEMA public TO jobblaster;

-- Ensure the jobblaster user can create tables
ALTER USER jobblaster CREATEDB;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO jobblaster;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO jobblaster;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO jobblaster;

-- Insert a welcome message into logs (will be visible in docker logs)
DO $$
BEGIN
    RAISE NOTICE 'JobBlaster database initialized successfully!';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE 'Schema: %', current_schema();
END $$;