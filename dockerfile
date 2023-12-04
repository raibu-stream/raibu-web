# Use a Node.js image to build the Svelte application
FROM node:16 AS build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build the app
RUN npm run build

# Use the official NGINX image as the base
FROM nginx

# Copy the nginx.conf file to the appropriate location
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built application from the first stage
COPY --from=build /app/build /usr/share/nginx/html

# Add a script that will generate the .htpasswd file
COPY generate-htpasswd.sh /usr/local/bin/

# Make the script executable
RUN chmod +x /usr/local/bin/generate-htpasswd.sh

# Run the script when the container starts
CMD ["/bin/sh", "-c", "/usr/local/bin/generate-htpasswd.sh && nginx -g 'daemon off;'"]