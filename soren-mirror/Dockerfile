FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
# NO copiar docs si no existen
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/interactive-soren.js"]