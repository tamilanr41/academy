# --- Express API production image ---
FROM node:22-alpine

ENV NODE_ENV=production \
    NODE_OPTIONS=--enable-source-maps \
    PORT=5000 \
    UPLOAD_DIR=/app/uploads

WORKDIR /app

# Install only runtime dependencies (lockfile is required for reproducible installs)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# Writable uploads directory owned by the unprivileged runtime user.
# Mount a named volume here in docker-compose so uploads survive redeploys.
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node

EXPOSE 5000

CMD ["node", "src/server.js"]
