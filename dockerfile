# Use the official NGINX image as the base
FROM nginx

# Copy the nginx.conf file to the appropriate location
COPY nginx.conf /etc/nginx/nginx.conf

# Install dependencies and compile project
run npm install
run npm run build

# Copy the files from the src folder to the NGINX document root
COPY build /usr/share/nginx/html

# Add a script that will generate the .htpasswd file
COPY generate-htpasswd.sh /usr/local/bin/

# Make the script executable
RUN chmod +x /usr/local/bin/generate-htpasswd.sh

# Run the script when the container starts
CMD ["/bin/sh", "-c", "/usr/local/bin/generate-htpasswd.sh && nginx -g 'daemon off;'"]