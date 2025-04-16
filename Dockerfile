FROM node:23.11.0-slim

WORKDIR /usr/src/app

# Install system dependencies and build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libsodium-dev \
    libopus-dev \
    ffmpeg \
    curl \
    python3 \
    make \
    g++ \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle compatibility issues
RUN npm ci --production --unsafe-perm --legacy-peer-deps

# Copy rest of the application
COPY . .

# Set Node.js specific environment variables
ENV NODE_ENV=production

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD [ "npm", "start" ]
