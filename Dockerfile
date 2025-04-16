FROM node:23.11.0-slim

WORKDIR /usr/src/app

# Install only runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libopus0 \
    libsodium23 \
    ffmpeg \
    curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy pre-built application
COPY . .

# Set Node.js specific environment variables
ENV NODE_ENV=production

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD [ "npm", "start" ]
