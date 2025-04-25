#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}SciQurio Project Deployment Script${NC}"
echo -e "${BLUE}=======================================${NC}"

# Default configuration
BACKEND_PORT=8000
MONGO_PORT=27017
API_URL="http://localhost:8000"

# Prompt for customization
echo -e "${YELLOW}Would you like to customize deployment settings? (y/n)${NC}"
read customize

if [ "$customize" = "y" ] || [ "$customize" = "Y" ]; then
    echo -e "${YELLOW}Enter backend port (default: 8000):${NC}"
    read custom_backend_port
    if [ ! -z "$custom_backend_port" ]; then
        BACKEND_PORT=$custom_backend_port
    fi
    
    echo -e "${YELLOW}Enter MongoDB port (default: 27017):${NC}"
    read custom_mongo_port
    if [ ! -z "$custom_mongo_port" ]; then
        MONGO_PORT=$custom_mongo_port
    fi
    
    echo -e "${YELLOW}Enter API URL for frontend (default: http://localhost:$BACKEND_PORT):${NC}"
    echo -e "${YELLOW}Note: If deploying to a server, use its public IP or domain name${NC}"
    read custom_api_url
    if [ ! -z "$custom_api_url" ]; then
        API_URL=$custom_api_url
    else
        API_URL="http://localhost:$BACKEND_PORT"
    fi
fi

# Fix broken dependencies
echo "Fixing broken dependencies..."
sudo apt --fix-broken install -y || echo "No broken dependencies to fix"

# Force remove conflicting MongoDB packages
echo "Removing conflicting MongoDB packages..."
sudo dpkg --remove --force-remove-reinstreq mongodb-server-core mongo-tools || echo "No conflicting MongoDB packages found"
sudo apt-get purge -y mongodb mongodb-server mongodb-server-core mongo-tools || echo "No old MongoDB versions found"
sudo apt-get autoremove -y
sudo apt-get autoclean -y
sudo rm -rf /var/lib/mongodb
sudo rm -rf /var/log/mongodb

# Install the latest MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Step 2: Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Step 3: Initialize the database
echo "Initializing the database..."
python scripts/db_init.py

# Step 4: Start the FastAPI backend
echo "Starting FastAPI backend..."
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Step 5: Build and deploy the frontend
echo "Building and deploying the frontend..."
cd ../frontend
# Update the config.js file if necessary
sed -i "s|export const API_URL = .*|export const API_URL = '$API_URL';|" src/config.js
sed -i "s|export const FRONTEND_URL = .*|export const FRONTEND_URL = 'http://localhost:8000';|" src/config.js

# Install dependencies and build the frontend
npm install
npm run build

# Install and configure Nginx
echo "Installing and configuring Nginx..."
# sudo apt-get -o Acquire::AllowInsecureRepositories=true install -y nginx || echo "Ignoring Nginx installation errors"

# Use a custom folder for Nginx instead of /var/www/html/
sudo mkdir -p /var/www/sciqurio-frontend

# Confirm the folder is correct before removing its contents
if [[ "/var/www/sciqurio-frontend" == "/var/www/sciqurio-frontend" && -d "/var/www/sciqurio-frontend" ]]; then
    echo "Clearing contents of /var/www/sciqurio-frontend..."
    sudo find "/var/www/sciqurio-frontend" -mindepth 1 -delete
else
    echo "Error: /var/www/sciqurio-frontend is not a valid target folder. Aborting."
    exit 1
fi

# Check if build directory exists and use it, otherwise try dist
if [ -d "build" ]; then
    echo "Found 'build' directory, copying files from there..."
    sudo cp -r build/* /var/www/sciqurio-frontend/
elif [ -d "dist" ]; then
    echo "Found 'dist' directory, copying files from there..."
    sudo cp -r dist/* /var/www/sciqurio-frontend/
else
    echo "Error: Neither 'build' nor 'dist' directory found. Build may have failed."
    exit 1
fi

# Update Nginx configuration to use the new folder and port 8000
sudo cp nginx.conf /etc/nginx/sites-available/sciqurio

# Enable the new Nginx configuration
sudo ln -sf /etc/nginx/sites-available/sciqurio /etc/nginx/sites-enabled/sciqurio
sudo systemctl restart nginx

