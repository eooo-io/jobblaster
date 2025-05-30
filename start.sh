#!/bin/sh

echo "JobBlaster starting up..."

# Wait for database to be ready
echo "Waiting for database connection..."
for i in $(seq 1 30); do
    if node -e "
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        pool.query('SELECT 1').then(() => {
            console.log('Database connected');
            process.exit(0);
        }).catch(() => {
            process.exit(1);
        });
    " 2>/dev/null; then
        echo "Database is ready"
        break
    fi
    echo "Waiting for database... ($i/30)"
    sleep 2
done

# Run database migrations
echo "Initializing database schema..."
npm run db:push

# Start the application
echo "Starting JobBlaster application..."
exec npm start