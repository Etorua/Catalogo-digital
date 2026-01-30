#!/bin/bash

# Stop on errors
set -e

echo "Starting Update Process..."

# 1. Server Dependencies & Migration
echo "Updating Server..."
cd server
npm install
# Apply only the safe migration for Cash Register (fixes missing tables)
# This script uses 'CREATE TABLE IF NOT EXISTS', so it is safe.
DB_USER=catalog_user DB_PASSWORD=catalog_password DB_NAME=catalog_db DB_HOST=localhost node apply_cash_migration.js || echo "Warning: Migration script failed or already applied."
cd ..

# 2. Build Client (Frontend)
echo "Building Client..."
cd client
npm install
npm run build
cd ..

# 3. Restart Services
echo "Restarting Services..."

# Restart Backend (PM2)
# We assume the process is named 'api' as per setup.sh
pm2 restart api || DB_USER=catalog_user DB_PASSWORD=catalog_password DB_NAME=catalog_db DB_HOST=localhost pm2 start server/index.js --name "api"

# Reload Nginx (to serve new static files if caching is an issue, though unwanted usually)
sudo systemctl reload nginx

echo "Update Complete! Database data was preserved."
