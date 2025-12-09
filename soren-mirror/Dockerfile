# --- ETAPA 1: Builder ---
# Usamos una imagen completa de Node para tener TypeScript y todas las herramientas
FROM node:lts-alpine AS builder

WORKDIR /app

# Copiamos solo los archivos de dependencias e instalamos TODO (incl. devDependencies)
COPY package.json package-lock.json ./
RUN npm install

# Copiamos todo el código fuente
COPY . .

# ¡EL PASO CLAVE! Compilamos el TypeScript a JavaScript.
RUN npm run build -- -p tsconfig.json


# --- ETAPA 2: Production ---
# Empezamos de nuevo con una imagen ligera, solo para ejecutar
FROM node:lts-alpine AS production

WORKDIR /app

# Copiamos las dependencias de producción desde la etapa 'builder'
COPY --from=builder /app/package.json /app/package-lock.json ./
# Instalamos SOLAMENTE las dependencias de producción
RUN npm install --omit=dev

# Copiamos la aplicación ya compilada desde la etapa 'builder'
COPY --from=builder /app/dist ./dist

# Copiamos las carpetas de 'docs' y 'data' que son necesarias en tiempo de ejecución
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/data ./data

# El comando final ahora ejecuta el archivo JavaScript compilado con Node.
CMD ["node", "dist/interactive-soren.js"]