# Use official Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
# This fulfills the "Initialized with npm" requirement
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the port specified in the API
EXPOSE 3000

# Start the server
# Make sure the filename matches your "app.js"
CMD ["node", "app.js"]