FROM node:20-alpine3.19

WORKDIR /api

COPY package.json .
COPY package-lock.json .

COPY . .

RUN npm i

CMD ["npm", "run", "start"]