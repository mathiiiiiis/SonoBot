FROM node:alpine
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
