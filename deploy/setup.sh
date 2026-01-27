#!/bin/bash

# Update and Install Dependencies
sudo apt-get update
sudo apt-get install -y nodejs npm postgresql postgresql-contrib nginx

# Install Node.js 20 (Simpler method for Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Setup PostgreSQL
# Check if db exists logic or just try create (ignore error)
sudo -u postgres psql -c "CREATE USER catalog_user WITH PASSWORD 'catalog_password';" || true
sudo -u postgres psql -c "CREATE DATABASE catalog_db OWNER catalog_user;" || true
sudo -u postgres psql -c "ALTER USER catalog_user CREATEDB;"

# Import Schema
# We assume the script is running from the root of the app where server/database.sql is
export PGPASSWORD='catalog_password'
# Clean import - carefull with data loss, but this is fresh install
# We use || true to ignore errors if objects already exist
psql -h localhost -U catalog_user -d catalog_db -f server/database.sql || true

# Apply Migrations (Updates)
echo "Applying Migrations..."
psql -h localhost -U catalog_user -d catalog_db -f server/update_orders_schema.sql || true
psql -h localhost -U catalog_user -d catalog_db -f server/update_marketing_schema.sql || true
psql -h localhost -U catalog_user -d catalog_db -f server/update_users_schema.sql || true
psql -h localhost -U catalog_user -d catalog_db -f server/update_fiscal_schema.sql || true

# Seed Data (New Products)
echo "Seeding Products..."
cd server
npm install
DB_USER=catalog_user DB_PASSWORD=catalog_password DB_NAME=catalog_db DB_HOST=localhost node seed_products.js || true

# Setup Backend
# (Already in server folder)
# npm install (Already done above)
# Update .env or use environment variables in PM2
npm install
# Update .env or use environment variables in PM2
# Start API
pm2 delete api || true
DB_USER=catalog_user DB_PASSWORD=catalog_password DB_NAME=catalog_db DB_HOST=localhost pm2 start index.js --name "api"
cd ..

# Setup Frontend
cd client
npm install
npm run build
cd ..

# Configure Nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/catalog
sudo ln -sf /etc/nginx/sites-available/catalog /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo "Deployment Complete!"
