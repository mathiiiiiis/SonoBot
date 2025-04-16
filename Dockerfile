FROM node:23.11.0-slim

# Create app directory and set permissions
WORKDIR /usr/src/app

# Install required system dependencies for canvas
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
    curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs -s /bin/bash nodejs && \
    chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Install dependencies first (caching)
COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --only=production

# Copy app source with correct ownership
COPY --chown=nodejs:nodejs . .

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set Node.js specific environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=2048" \
    NPM_CONFIG_LOGLEVEL=warn

CMD [ "npm", "start" ]
