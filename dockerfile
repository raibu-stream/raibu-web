# Use a smaller base image
FROM node:alpine AS build

WORKDIR /app

COPY package*.json ./

ARG RAIBU_DB_HOST
ARG RAIBU_DB_USER
ARG RAIBU_DB_PASSWORD
ARG RAIBU_EMAIL_HOST
ARG RAIBU_EMAIL_PORT
ARG RAIBU_EMAIL_USER
ARG RAIBU_EMAIL_PASS

RUN npm install

COPY . .

ENV RAIBU_DB_HOST=${RAIBU_DB_HOST}
ENV RAIBU_DB_USER=${RAIBU_DB_USER}
ENV RAIBU_DB_PASSWORD=${RAIBU_DB_PASSWORD}
ENV RAIBU_EMAIL_HOST=${RAIBU_EMAIL_HOST}
ENV RAIBU_EMAIL_PORT=${RAIBU_EMAIL_PORT}
ENV RAIBU_EMAIL_USER=${RAIBU_EMAIL_USER}
ENV RAIBU_EMAIL_PASS=${RAIBU_EMAIL_PASS}

RUN npm run build

# Start a new, final image to keep it clean
FROM node:alpine AS production

WORKDIR /app

# Copy only the built app and the package files
COPY --from=build /app/build .
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]