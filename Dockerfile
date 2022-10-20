FROM node:17.7.1-stretch-slim

WORKDIR /opt/app/series-manager
COPY package.json package-lock.json ./
RUN npm install --no-optional && npm cache clean --force

COPY . .

# Not working, must put config.json in a subfolder or select its path from env var
CMD ["node", "/opt/app/series-manager/src/index.mjs"]
