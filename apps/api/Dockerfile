FROM node:20-alpine
WORKDIR /usr/src/app

COPY apps/api/package*.json ./apps/api/
RUN cd ./apps/api && npm install --no-audit --no-fund

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["sh", "-c", "cd /usr/src/app/apps/api && npm run dev"]
