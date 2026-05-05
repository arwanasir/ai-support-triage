FROM node:20-alpine AS base
WORKDIR /usr/src/app/apps/api
COPY apps/api/package*.json ./
RUN npm install --no-audit --no-fund

COPY . /usr/src/app
EXPOSE 3000

CMD ["npm", "run", "dev"]
