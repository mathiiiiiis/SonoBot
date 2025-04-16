FROM node:21-slim

WORKDIR /usr/src/app

COPY . .

RUN chown -R node:node /usr/src/app
USER node

CMD ["npm", "start"]
