FROM node:20-slim

WORKDIR /home/node/app

RUN apt-get update && apt-get install -y build-essential libpq-dev

COPY package*.json ./

RUN npm install

RUN npx prisma generate

COPY . .
