FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Set proper user permissions
RUN chown -R node:node /usr/src/app
USER node

# Start the bot
CMD ["npm", "start"]