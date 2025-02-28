# Stage 1: Build the Vue.js application
FROM node:20.15 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using a Node.js server
FROM node:20.15

# Set the working directory in the container
WORKDIR /app

# Copy the build output and package.json from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
