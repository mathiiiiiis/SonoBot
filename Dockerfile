FROM node:21-alpine

WORKDIR /usr/src/app

# Install build deps needed for native packages
RUN apk add --no-cache --virtual .gyp python3 make g++

COPY package*.json ./

# Run npm install
RUN npm ci --only=production

COPY . .

# Set correct permissions
RUN chown -R node:node /usr/src/app
USER node

CMD ["npm", "start"]
