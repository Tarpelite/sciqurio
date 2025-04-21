#!/bin/bash

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

# Update docker-compose file with custom ports
sed -i "s/- \"$BACKEND_PORT:$BACKEND_PORT\"/- \"$BACKEND_PORT:8000\"/g" docker-compose.yml
sed -i "s/- \"$MONGO_PORT:$MONGO_PORT\"/- \"$MONGO_PORT:27017\"/g" docker-compose.yml

echo -e "${GREEN}Building and starting Docker containers...${NC}"
echo -e "${YELLOW}API URL for frontend is set to: $API_URL${NC}"
docker-compose build --build-arg API_URL=$API_URL
docker-compose up -d

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}Services:${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Backend API: http://localhost:$BACKEND_PORT${NC}"
echo -e "${YELLOW}MongoDB: localhost:$MONGO_PORT${NC}"
echo -e "${BLUE}=======================================${NC}"
