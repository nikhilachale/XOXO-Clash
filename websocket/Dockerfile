# Use Node.js LTS
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and lock
COPY package*.json ./

# Install deps
RUN npm install

# Copy the rest
COPY . .

# Expose the port (Cloud Run uses PORT env var)
EXPOSE 8080

# Start app
CMD ["npm", "start"]