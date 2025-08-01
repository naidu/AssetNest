#!/bin/bash
set -e

echo "Initializing AssetNest Database..."

# Wait for MySQL to be ready
until mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1"; do
  echo "Waiting for MySQL to be ready..."
  sleep 2
done

echo "MySQL is ready. Running schema initialization..."

# Run schema
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /docker-entrypoint-initdb.d/01-schema.sql

echo "Running seed data..."

# Run seed data
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /docker-entrypoint-initdb.d/02-seed.sql

echo "Database initialization completed successfully!"
