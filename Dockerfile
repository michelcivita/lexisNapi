# Use Puppeteer-specific Docker image
FROM ghcr.io/puppeteer/puppeteer:latest as build-stage
# FROM node:latest

# Set working directory inside the container
WORKDIR /app

# Copy source code to container
COPY . .

# Install dependencies
RUN npm install

ENV PORT=8071

EXPOSE 8071

ENTRYPOINT [ "node", "app.js" ]

# nginx
FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf