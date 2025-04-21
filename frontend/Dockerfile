FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Argument for API URL that can be set during build
ARG API_URL=http://localhost:8000

# Replace API_URL in config.js
RUN sed -i "s|export const API_URL = .*|export const API_URL = '${API_URL}';|g" src/config.js

# Build the app
RUN npm run build

# Stage 2: Production environment
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
