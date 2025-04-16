FROM node:21-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install discord.js

COPY . .

RUN chown -R node:node /usr/src/app
USER node

CMD ["npm", "start"]
