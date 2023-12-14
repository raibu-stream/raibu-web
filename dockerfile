# Use the most recent stable version of Node as the base image
FROM node:latest AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Declare the arguments
ARG RAIBU_DB_HOST
ARG RAIBU_DB_USER
ARG RAIBU_DB_PASSWORD

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Set the environment variables for the database connection
ENV RAIBU_DB_HOST=${RAIBU_DB_HOST}
ENV RAIBU_DB_USER=${RAIBU_DB_USER}
ENV RAIBU_DB_PASSWORD=${RAIBU_DB_PASSWORD}

# Build the SvelteKit website
RUN npm run build

# Use Node.js to serve the built app
FROM node:latest AS production

# Set the working directory
WORKDIR /app

# Copy the built app from the build stage
COPY --from=build /app/build .

# Install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]