# stage 1
FROM node:20-alpine3.19 as builder

WORKDIR /api

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm build

# stage 2
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR dist
COPY --from=builder /api/dist .

CMD ["node", "server.js"]