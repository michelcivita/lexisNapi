# Use the official Node.js image as the base image
FROM node:14-alpine as build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

ARG ENV=production

ENV NODE_ENV=$ENV

# Expose the port that your app runs on
EXPOSE 8071

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app /app
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
# Command to run the application
CMD ["node", "app.js"]