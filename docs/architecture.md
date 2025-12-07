# Resumen de Arquitectura: Søren Mirror (Respaldo Documental)

* Visión General
Aplicación Node.js stand-alone dockerizada que actúa como "Segundo Cerebro" para escritura creativa. Gestiona dos flujos: archivado de contexto sin juicio y crítica literaria usando memoria acumulada con LLM (Gemini).

## Estructura de Directorios
- **Raíz**: Configuración (.env, docker-compose.yml, Dockerfile, package.json).
- **data/**: Volumen persistente para memoria (contexto_global.md), descargas y logs.
- **src/**: Código fuente dividido en config/, core/ (LLM y prompts), modules/ (Telegram, archivist, scraper).

## Infraestructura Docker
- **Dockerfile**: Basado en `ghcr.io/puppeteer/puppeteer:latest` para soporte de Chrome/Puppeteer (librerías del SO necesarias). Configura usuario no-root, instala dependencias y ajusta permisos.
- **docker-compose.yml**: Orquesta contenedor `soren-mirror` con reinicio automático, volúmenes para persistencia, 1GB de memoria compartida para Chrome, y variables de entorno para producción.

## Lógica de Prompts
- **Flujo Archivista**: Inputs con #contexto → Anexa a contexto_global.md sin IA.
- **Flujo Guía Crítico**: Bocetos literarios → Inyecta memoria en prompt de Gemini para crítica dura (0% complacencia), evaluando autenticidad vs. vivencias.

```bash
/soren-mirror
│
├── .env                       # Credenciales (Gemini API, Telegram Token, Read.ai)
├── .gitignore                 # Ignora node_modules, .env y la carpeta data/local
├── docker-compose.yml         # Orquestador del contenedor y volúmenes
├── Dockerfile                 # Definición de la imagen con soporte para Navegador
├── package.json  # Dependencias: telegraf, puppeteer, @google/generative-ai
│
├── 📂 data/                   # [VOLUMEN PERSISTENTE]
│   │                          # Esta carpeta se mapea al disco del host.
│   ├── contexto_global.md     # La "Memoria a Largo Plazo" (acumulación de vivencias).
│   ├── downloads/             # Destino de los PDFs/TXTs bajados de Read.ai.
│   └── logs/                  # Logs de ejecución y errores.
│
└── 📂 src/                    # [CÓDIGO FUENTE]
    ├── index.js               # Punto de entrada (Entry Point).
    │
    ├── 📂 config/
    │   └── env.js             # Validación de variables de entorno.
    │
    ├── 📂 core/               # Lógica de Inteligencia Artificial.
    │   ├── llm.js             # Cliente de Gemini (Google AI).
    │   └── prompts.js         # Lógica de inyección de contexto (Guía vs. Soren Mirror).
    │
    └── 📂 modules/            # Habilidades del Bot.
        ├── telegram.js        # Listener del chat y ruteo de comandos.
        ├── archivist.js       # Lectura/Escritura en 'contexto_global.md'.
        └── scraper.js         # Automatización de navegador (Puppeteer) para Read.ai.++
```

# 3. Infraestructura Docker (Explicada)

### El Dockerfile (La Imagen)
- Este archivo define el entorno. Usamos una imagen específica para soportar la automatización de descargas.

```bash
# -----------------------------------------------------------------------------
# IMAGEN BASE: Usamos la oficial de Puppeteer.
# ¿POR QUÉ? Puppeteer controla un navegador Chrome real para automatizar descargas.
# Chrome necesita muchas librerías de sistema (libx11, libxss, etc.) que no vienen
# en la imagen 'node:alpine' normal. Esta imagen ya trae todo configurado.
# -----------------------------------------------------------------------------

FROM ghcr.io/puppeteer/puppeteer:latest

# Cambiamos a usuario ROOT temporalmente.
# ¿POR QUÉ? Necesitamos permisos de superusuario para crear carpetas de sistema
# o instalar utilidades extra si hiciera falta.
USER root

# Directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos primero los archivos de definición de dependencias.
# ¿POR QUÉ? Docker "cachea" esta capa. Si no cambias el package.json,
# Docker no volverá a ejecutar 'npm install', haciendo el build muy rápido.
COPY package*.json ./

# Instalamos las dependencias del proyecto.
# 'npm ci' es más rápido y seguro para entornos de producción que 'npm install'.
RUN npm ci

# Copiamos el resto del código fuente al contenedor.
COPY . .

# Creamos la carpeta 'data' y ajustamos permisos.
# ¿POR QUÉ? Como luego volveremos a un usuario restringido (pptruser),
# necesitamos asegurarnos de que ese usuario tenga permiso de escribir
# en la carpeta donde se guardarán los contextos y descargas.
RUN mkdir -p /app/data && chown -R pptruser:pptruser /app/data

# Volvemos al usuario seguro.
# ¿POR QUÉ? Es una mala práctica de seguridad correr aplicaciones Node.js como root.
USER pptruser

# Comando de inicio del contenedor.
CMD ["node", "src/index.js"]
```

## B. El docker-compose.yml (El Orquestador)
- Este archivo define cómo corre el servicio y cómo guarda los datos.
```bash
YAML

version: '3.8'

services:
  YAML

version: '3.8'

services:
  soren-mirror:
    # Construye la imagen usando el Dockerfile de la carpeta actual
    build: . 
    container_name: soren-mirror-v1
    
    # Política de reinicio: Si el bot crashea (error de código), Docker lo levanta de nuevo.
    # 'unless-stopped' significa que solo se queda apagado si lo frenás manualmente.
    restart: unless-stopped
    
    # Inyecta las claves secretas desde el archivo .env
    env_file:
      - .env
    
    # VOLÚMENES (La parte más importante):
    # Conecta la carpeta './data' de tu VPS con '/app/data' del contenedor.
    # ¿POR QUÉ? Si borrás el contenedor para actualizar el código, 
    # tu archivo 'contexto_global.md' NO SE PIERDE, porque vive en tu VPS.
    volumes:
      - ./data:/app/data
    
    # Memoria Compartida (Shared Memory)
    # ¿POR QUÉ? Chrome (Puppeteer) usa mucha memoria compartida para renderizar pestañas.
    # El valor por defecto de Docker (64MB) es muy poco y hace que Chrome crashee.
    # Le damos 1GB para que navegue 'read.ai' sin problemas.
    shm_size: '1gb'
    
    # Variables de entorno específicas para Puppeteer
    environment:
      - NODE_ENV=production
      # Le decimos al script dónde buscar el Chrome que instalamos en el Dockerfile
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

# 4. Lógica de los Prompts (Guía vs. )
El sistema distingue automáticamente la intención del usuario basándose en el input. Esta lógica reside en src/core/prompts.js y src/index.js.
## **Flujo A**: El Archivista 
**Trigger**: Mensajes que comienzan con una etiqueta (ej: #vivencia o #contexto).

### Acción:
* Toma el texto crudo.
* Lo limpia mínimamente (fecha, formato).
* Lo anexa al final de data/contexto_global.md.
* **Prompt de IA**: Ninguno (o uno muy básico de formateo). La IA no opina, solo registra.

## Flujo B: La Guía (Editor Crítico)
**Trigger**: Mensajes de texto normal (Bocetos literarios).

### Acción:
* Lee el archivo data/contexto_global.md completo.
* Inyecta ese contenido en el Prompt Maestro (variable `MEMORIA_DINAMICA`).
* Envía el prompt + el boceto a Gemini.
* **Prompt de IA:** "0% Complacencia". Usa la memoria cargada para detectar si el texto es auténtico o impostado, comparándolo con las **vivencias reales del autor**.