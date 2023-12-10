# Use a Node.js image to build and run the Svelte application
FROM node:18 AS build-and-run

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build the app
RUN npm run build

# Run the app
CMD ["node", "./build"]

# Use the official NGINX image as the base
FROM nginx as deploy

# Copy the nginx.conf file to the appropriate location
COPY nginx.conf /etc/nginx/nginx.conf

# Run the script when the container starts
ENTRYPOINT ["nginx", "-g", "daemon off;"]