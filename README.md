
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)

# 🪞 Søren Mirror: Asistente de Escritura Personal
> "No soy una fábrica de textos, flaco. Tengo un espejo maldito que navega en tus experiencias, yo conozco tu dolor. No te pienso dar nigun texto escrito, a no ser que mi lo pidas. Podemos pensar titulos, te puedo ayudar a resignificar la profundad de tu narrativa, hay muchos detalles que solemos pasar por alto, te puedo ayudar a conectar algunas neurnas en una de esas. Pero' escuchame gurí, te aviso yo soy un tipo honesto. Si te ganaste un elogia, sentite agradecido. Pero tranqui, siempre con la ternura y la honestidad intacta. Cualquier cosita hablame por telegram"

## Identidad y Propósito
**Søren Mirror** es un agente autónomo diseñado para actuar como un **Segundo Cerebro** en el proceso de escritura creativa, especialmente útil para personas con TDAH y otros creativos. Su nombre invoca la angustia existencial de Kierkegaard y la frialdad funcional de un espejo tecnológico.

No escribe por mí. Su función es procesar mis vivencias (contexto) y criticar mi producción literaria (bocetos) con un enfoque clínico, detectando si el ritmo obedece a la sedación o a la ansiedad. A través de parametrización, puede ayudar a otros, navegando experiencias como un jazz improvisado: estoico, auténtico y sin perder la identidad.

## 🏗 Arquitectura
El sistema es una aplicación **Node.js Stand-Alone** dockerizada que opera en dos modos:

1.  **Modo Archivista (Memoria):**
    * **Input:** Audios o textos crudos con vivencias (etiquetados con `#contexto`).
    * **Acción:** Procesa, limpia y guarda la información en la "Memoria a Largo Plazo" (`contexto_global.md`) sin emitir juicio.
2.  **Modo Søren (Guía Crítico):**
    * **Input:** Bocetos literarios o ideas sueltas.
    * **Acción:** Inyecta la "Memoria" acumulada en el prompt y utiliza un LLM (Gemini) para ofrecer una crítica estoica sobre el ritmo, la honestidad y la potabilidad artística, navegando como un jazz basado en experiencias reales sin complacencia excesiva.


## Inicio Rápido

### Requisitos
* Docker y Docker Compose.
* Una API Key de Google Gemini.
* Un Token de Bot de Telegram.

### Instalación
1.  Clonar el repositorio.
2.  Crear el archivo `.env` basado en el ejemplo:

    ```bash
    GEMINI_API_KEY=tu_clave
    TELEGRAM_BOT_TOKEN=tu_token
    # Opcionales para automatización futura
    READ_AI_EMAIL=tu_email
    READ_AI_PASSWORD=tu_pass
    ```
3.  Levantar el servicio:
    ```bash
    docker-compose up -d
    ```

## 📂 Documentación Técnica
Este proyecto sigue los principios de **Docs as Code**, donde la documentación se trata como código: versionada en Git, escrita en Markdown para facilitar la colaboración, y integrada en el flujo de desarrollo para mantenerla actualizada y automatizada.


Para una guía completa, incluyendo arquitectura detallada, flujos de datos, configuración de Docker, parametrización para TDAH y otros usuarios, y ejemplos de uso, consultar:

> 📂 [documentation.md](./docs/documentation.md)

Para entender la estructura interna, los flujos de datos y la configuración de Docker, consultar:

>  📂 [Arquitectura de Søren Mirror](./docs/architecture/architecture.md)


### Resumen de Arquitectura
- **Visión General**: Aplicación Node.js stand-alone dockerizada que actúa como "Segundo Cerebro" para escritura creativa. Gestiona dos flujos: archivado de contexto sin juicio y crítica literaria usando memoria acumulada con LLM (Gemini).
- **Estructura de Directorios**:
  - **Raíz**: Configuración (.env, docker-compose.yml, Dockerfile, package.json).
  - **data/**: Volumen persistente para memoria (contexto_global.md), descargas y logs.
  - **src/**: Código fuente dividido en config/, core/ (LLM y prompts), modules/ (Telegram, archivist, scraper).
- **Infraestructura Docker**:
  - **Dockerfile**: Basado en `ghcr.io/puppeteer/puppeteer:latest` para soporte de Chrome/Puppeteer (librerías del SO necesarias). Configura usuario no-root, instala dependencias y ajusta permisos.
  - **docker-compose.yml**: Orquesta contenedor `soren-mirror` con reinicio automático, volúmenes para persistencia, 1GB de memoria compartida para Chrome, y variables de entorno para producción.
- **Lógica de Prompts**:
- **Flujo Archivista**: Inputs con #contexto → Anexa a contexto_global.md sin IA.
  - **Flujo Guía Crítico**: Bocetos literarios → Inyecta memoria en prompt de Gemini para crítica honesta, realista. Si es trillado pero es un estilo intencional, soren comprenderá la situación. Los vocetos, si son dignos de dolerle el corazón, puede tener posibilidad de enaltezer su autoestima, pero siendo realista (100% honestidad, 100%objetividad), evaluando las conexiones de las entradas, para ayudar a formular relaciones entre el #contexto previsto. 

Una guía completa de documentación estará disponible en [docs/documentation.md](./docs/documentation.md).