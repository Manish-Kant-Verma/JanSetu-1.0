# JanSetu — single-container deployment (Express API + built React client)
# Usage:
#   docker build -t jansetu .
#   docker run -p 4000:4000 -v jansetu-data:/data -e JWT_SECRET=change-me jansetu

# ---------- build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

RUN npm install --prefix server --include=dev \
 && npm install --prefix client --include=dev

COPY server ./server
COPY client ./client

RUN npm run build --prefix client

# ---------- runtime stage ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=4000 \
    JANSETU_DATA_DIR=/data
WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN npm install --prefix server --omit=dev && npm cache clean --force

COPY --from=build /app/server/src ./server/src
COPY --from=build /app/server/tsconfig.json ./server/tsconfig.json
COPY --from=build /app/client/dist ./client/dist

# the JSON database and uploaded evidence live on this volume
RUN mkdir -p /data/uploads && chown -R node:node /data /app
VOLUME ["/data"]
USER node

EXPOSE 4000
CMD ["npm", "start", "--prefix", "server"]