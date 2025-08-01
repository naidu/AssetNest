#!/bin/bash
set -e

echo "Initializing AssetNest Database..."

# Wait for MySQL to be ready
until mysql -h"localhost" -u"root" -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1"; do
  echo "Waiting for MySQL to be ready..."
  sleep 2
done

echo "MySQL is ready. Running schema initialization..."

# Run schema
mysql -h"localhost" -u"root" -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < /docker-entrypoint-initdb.d/01-schema.sql

echo "Running seed data..."

# Run seed data
mysql -h"localhost" -u"root" -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < /docker-entrypoint-initdb.d/02-seed.sql

echo "Database initialization completed successfully!"
