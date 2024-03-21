# Use the official Node.js image as the base image for build stage
FROM node:14-alpine as build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build your application (if necessary)
# RUN npm run build

# ------

# Use a separate stage for production
FROM node:14-alpine as production-stage

# Set the working directory
WORKDIR /app

# Copy built artifacts and necessary files from the build stage
COPY --from=build-stage /app .

# Set the production environment
ENV NODE_ENV=production

# Expose the port that your app runs on
EXPOSE 8071

# Command to run the application
CMD ["node", "app.js"]
