#!/bin/sh

# Split the HTPASSWD environment variable into lines, replace $$ with $ in the password hashes, and write them to the .htpasswd file
echo "$HTPASSWD" | tr ',' '\n' | sed 's/\$\$/\$/g' > /etc/nginx/.htpasswd