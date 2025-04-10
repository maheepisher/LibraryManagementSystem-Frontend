FROM nginx:alpine

# Copy all frontend files (HTML, CSS, JS) to the Nginx serving directory
COPY . /usr/share/nginx/html

# Copy the entrypoint script to inject the API URL
COPY entrypoint.sh /entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /entrypoint.sh

# Set the entrypoint to run the script
ENTRYPOINT ["/entrypoint.sh"]