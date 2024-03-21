FROM ghcr.io/puppeteer/puppeteer:22.6.0

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 80
EXPOSE 443

CMD [ "node", "app.js" ]