# Dockerfile para soren-mirror (CLI)
FROM node:lts-alpine

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código (Asegúrate de tener un .dockerignore aquí también!)
COPY . .

# Comando por defecto (ajusta si usas ts-node o si compilas)
# Usamos ts-node directo para desarrollo rápido
CMD ["npx", "ts-node", "src/interactive-soren.ts"]