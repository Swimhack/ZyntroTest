FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
