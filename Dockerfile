# Define all the Docker instructions necessary for Docker Engine to build an image

# # Use node version 18.16.0
FROM node:18.16.0

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
COPY package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running the server
CMD npm start

# Service runs on port 8080
EXPOSE 8080
