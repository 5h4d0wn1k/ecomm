#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case schema changed)
echo "Generating Prisma client..."
npx prisma generate

# Start the application
echo "Starting application..."
exec "$@"