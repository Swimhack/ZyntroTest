FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Copy .htaccess rules to nginx config if needed
# Note: nginx doesn't use .htaccess, but we'll keep the files for compatibility

# Expose port
EXPOSE 8080

# Update nginx to listen on port 8080 instead of 80
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
