FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
WORKDIR /usr/src/app/apps/api
EXPOSE 3000

CMD ["npm", "run", "dev"]