ALTER TABLE users ALTER COLUMN date_of_birth SET DEFAULT '';
UPDATE users SET date_of_birth = '' WHERE date_of_birth IS NULL;
