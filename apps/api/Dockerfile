FROM node:24-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
