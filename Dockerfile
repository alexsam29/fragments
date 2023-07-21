# Define all the Docker instructions necessary for Docker Engine to build an image

#####################################################################################################################
# Stage 0: Install Dependencies

# # Use node version 18.16 and alpine 3.18
FROM node:18.16-alpine3.18@sha256:d5b2a7869a4016b1847986ea52098fa404421e44281bb7615a9e3615e07f37fb AS dependencies

LABEL maintainer="Alexander Samaniego <asamaniego@myseneca.ca>"
LABEL description="Fragments Microservice - node.js"

# Default to use port 8080
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY --chown=node:node package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm ci --production

#####################################################################################################################
# Stage 1: Use dependencies to build

# # Use node version 18.16 and alpine 3.18
FROM node:18.16-alpine3.18@sha256:d5b2a7869a4016b1847986ea52098fa404421e44281bb7615a9e3615e07f37fb AS build

# Use /app as working directory
WORKDIR /app

# Copy cached dependencies from previous stage so we don't have to download
COPY --from=dependencies /app /app

# Copy src to /app/src/
COPY ./src ./src

# Copy HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Add curl
RUN apk --update --no-cache add curl=8.2.0-r1

# Switch USER to node
USER node

# Start the container by running the server
CMD ["npm", "start"]

# Service runs on port 8080
EXPOSE 8080

# Health Check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8080 || exit 1
