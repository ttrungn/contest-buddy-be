# Use the official Node.js 18 LTS runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
# This is done before copying the entire source code to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install Babel CLI globally for production builds
RUN npm install -g @babel/cli @babel/core

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the application (security best practice)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port that the app runs on
EXPOSE 8080

# Define environment variable for production
ENV NODE_ENV=production

# Add healthcheck to monitor container health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Create a simple healthcheck file
USER root
RUN echo 'const http = require("http"); \
const options = { \
  host: "localhost", \
  port: 8080, \
  timeout: 2000, \
  path: "/health" \
}; \
const request = http.request(options, (res) => { \
  console.log(`STATUS: ${res.statusCode}`); \
  if (res.statusCode == 200) { \
    process.exit(0); \
  } else { \
    process.exit(1); \
  } \
}); \
request.on("error", function(err) { \
  console.log("ERROR"); \
  process.exit(1); \
}); \
request.end();' > /app/healthcheck.js

USER nodejs

# Command to run the application
# For production, we'll use babel-node directly instead of nodemon
CMD ["npx", "babel-node", "src/server.js"]
