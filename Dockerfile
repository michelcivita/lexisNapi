# Use Puppeteer-specific Docker image
FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory inside the container
WORKDIR /app

# Copy source code to container
COPY . .

# Install dependencies
RUN npm install

ENV PORT=8062

EXPOSE $PORT

# Command to run your application
CMD ["node", "app.js"]