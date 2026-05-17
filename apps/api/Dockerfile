FROM node:20-alpine

WORKDIR /usr/src/app

COPY apps/api/package*.json ./apps/api/
WORKDIR /usr/src/app/apps/api
RUN npm install --no-audit --no-fund


WORKDIR /usr/src/app
COPY . .

EXPOSE 3000

WORKDIR /usr/src/app/apps/api
CMD ["npm", "run", "dev"]







