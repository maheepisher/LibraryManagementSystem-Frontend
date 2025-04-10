#!/bin/sh
# Replace __API_URL__ placeholder with the actual API_URL environment variable
sed -i "s|__API_URL__|${API_URL}|g" /usr/share/nginx/html/*.js

# Start Nginx
nginx -g 'daemon off;'