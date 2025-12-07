# 🪞 Søren Mirror: Asistente de Escritura Personal

> "No es una fábrica de textos. Es un espejo filosófico con 0% de complacencia."

## Identidad y Propósito
**Søren Mirror** es un agente autónomo diseñado para actuar como un **Segundo Cerebro** en el proceso de escritura creativa. Su nombre invoca la angustia existencial de Kierkegaard y la frialdad funcional de un espejo tecnológico.

No escribe por mí. Su función es procesar mis vivencias (contexto) y criticar mi producción literaria (bocetos) con un enfoque clínico, detectando si el ritmo obedece a la sedación o a la ansiedad.

## 🏗 Arquitectura
El sistema es una aplicación **Node.js Stand-Alone** dockerizada que opera en dos modos:

1.  **Modo Archivista (Memoria):**
    * **Input:** Audios o textos crudos con vivencias (etiquetados con `#contexto`).
    * **Acción:** Procesa, limpia y guarda la información en la "Memoria a Largo Plazo" (`contexto_global.md`) sin emitir juicio.
2.  **Modo Søren (Guía Crítico):**
    * **Input:** Bocetos literarios o ideas sueltas.
    * **Acción:** Inyecta la "Memoria" acumulada en el prompt y utiliza un LLM (Gemini) para ofrecer una crítica dura sobre el ritmo, la honestidad y la potabilidad artística.

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
Para entender la estructura interna, los flujos de datos y la configuración de Docker, consultar:
👉 [Arquitectura de Søren Mirror](./docs/architecture.md)