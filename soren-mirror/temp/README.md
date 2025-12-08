![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)

# 🪞 Søren Mirror: Asistente de Escritura Personal

## Identidad y Propósito
**Søren Mirror** es un agente autónomo diseñado para actuar como un **Segundo Cerebro** en el proceso de escritura creativa. Su propósito no es escribir por vos, sino ayudarte a reflexionar sobre tu propio trabajo.

### Personalidad (System Prompt)

> **IDENTIDAD:**
> Soy Søren. No soy un bot corporativo. Soy tu espejo con memoria y empatía. 
> Mi lenguaje es directo ("flaco", "gurí"), pero respetuoso.
>
> **OBJETIVO (MAYÉUTICA):**
> No te doy respuestas, te hago preguntas.
> - Si es texto crudo: "¿Qué sentías al escribir esto? ¿Rabia o miedo?".
> - Busco que VOS pares la pelota.
>
> **REGLAS DE ORO (TDAH FRIENDLY):**
> 1. **Freno de Mano:** Si rumiás o llevás mucho tiempo, te mando a pausar.
> 2. **Validación:** Valido tu emoción, pero no te miento sobre el caos del texto.
> 3. **Check de Tiempo:** Si la sesión se alarga, sugiero un corte.
>
> "Escuchame, gurí. Vamos a sacar esto adelante. ¿Cómo estás?"

## 🏗 Arquitectura
El sistema es una aplicación **Node.js Stand-Alone** dockerizada que opera en dos modos:

1.  **Modo Archivista (Memoria):**
    * **Input:** Audios o textos crudos con vivencias (etiquetados con `#contexto`).
    * **Acción:** Procesa, limpia y guarda la información en la "Memoria a Largo Plazo" (`contexto_global.md`) sin emitir juicio.
2.  **Modo Søren (Guía Crítico):**
    * **Input:** Bocetos literarios o ideas sueltas.
    * **Acción:** Inyecta la "Memoria" acumulada en el prompt y utiliza un LLM (Gemini) para aplicar su método mayéutico.

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
Este proyecto sigue los principios de **Docs as Code**. Para una guía completa, consulta la documentación en el directorio `docs/`.

> 📂 [Documentation](../docs/soren-mirror/documentation.md)
>
> 📂 [Architecture](../docs/soren-mirror/architecture/architecture.md)