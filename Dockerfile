# --- Stage 1: Build React client ---
FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install
COPY client/ ./
ENV REACT_APP_API_URL=
RUN npm run build

# Stage 2: Production server
FROM node:20-slim
WORKDIR /app

# Install build dependencies for native modules (like argon2)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install server dependencies
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install --omit=dev

# Copy server code
COPY server/ ./server/

# Copy client build from stage 1
COPY --from=client-build /app/client/build ./client/build

EXPOSE 8080
WORKDIR /app/server
CMD ["node", "./bin/www"]