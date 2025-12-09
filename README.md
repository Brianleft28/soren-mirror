# 🪞 Søren Mirror

> *"Un espejo cóncavo para la mente neurodivergente."*

## 🌑 Manifiesto
Søren no es un chatbot. No es un "amigo virtual". Es un **Regulador de Voltaje** diseñado para una mente que opera en ráfagas de caos y silencio.

Este proyecto busca resolver un problema técnico y personal: **¿Cómo evitar que el "Hiperfoco" se convierta en Burnout?** La respuesta no es la disciplina (que falla), sino la **Inferencia Activa** y el **Ritmo**.

## 🧠 Dualidad de Personalidad

Søren opera en dos modos distintos, cada uno con su propio propósito y arquitectura:

### 1. Søren Public (El Asistente del Portfolio)
*   **Misión:** Actuar como un asistente técnico que responde preguntas sobre la experiencia y proyectos de Brian Benegas.
*   **Ubicación:** Integrado en la aplicación web del [**Portfolio**](./portfolio).
*   **Cerebro:** Utiliza el contenedor `ollama` local para garantizar la privacidad y el control.
*   **Personalidad:** Definida en [`docs/vision/public_persona.md`](docs/vision/public_persona.md). Es profesional, cercano y se basa estrictamente en el contexto provisto.

### 2. Søren Writer (El Espejo Privado)
*   **Misión:** Ser un "espejo terapéutico" para el proceso de escritura, aplicando técnicas de mayéutica y gestión de fatiga.
*   **Ubicación:** Es una herramienta de línea de comandos (CLI) interactiva en [`soren-mirror`](./soren-mirror).
*   **Cerebro:** Utiliza la API de **Google Gemini** para un razonamiento más complejo.
*   **Personalidad:** Definida en [`docs/vision/private_persona.md`](docs/vision/private_persona.md). Es directo, empático y está equipado con capacidades cognitivas.

## ⚙️ Capacidades Cognitivas (Modo Writer)

El modo privado integra varios módulos para actuar como un verdadero regulador:

*   **`StressManager` (Monitor de Síncopa):** Mide la "verborragia" (densidad y velocidad de escritura) para inferir estados de estrés o manía y adaptar la respuesta. (Ver [ADR-002](./docs/architecture/decisions.md)).
*   **`Chronos` (Gestión de Fatiga):** Utiliza un algoritmo de probabilidad estocástica para sugerir pausas, evitando la "ceguera de alarma" de los temporizadores fijos. (Ver [ADR-005](./docs/architecture/decisions.md)).
*   **`Archivist` (Memoria a Largo Plazo):** Guarda automáticamente cada sesión de escritura en el directorio `data/stories`, asegurando que ninguna idea se pierda.

## 🛠️ Stack Tecnológico y Arquitectura

Este proyecto es un **monorepo** orquestado con **Docker Compose**.

*   **Core:** Node.js + TypeScript.
*   **Cerebro IA:**
    *   **Local:** `Ollama` (con `dolphin-mistral`) para el modo público.
    *   **Cloud:** `Google Gemini` para el modo privado.
*   **Servicios:**
    *   `portfolio`: Frontend SvelteKit.
    *   `soren-mirror`: CLI interactiva con `Inquirer.js`.
*   **Infraestructura:** Docker.
*   **Filosofía:** "Docs as Code". Toda la documentación, personalidades y contexto viven en el directorio [`docs/`](./docs).

## 🚀 Instalación y Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/brianleft28/soren-mirror.git
    cd soren-mirror
    ```

2.  **Configurar las variables de entorno:**
    *   Copia `.env.example` a un nuevo archivo `.env` en la raíz del proyecto.
    *   Rellena tu `GEMINI_API_KEY`.

3.  **Levantar todos los servicios:**
    ```bash
    docker-compose up -d --build
    ```
    *   Esto iniciará el contenedor del portfolio y el de Ollama.
    *   El portfolio estará disponible en `http://localhost:3000`.

4.  **Ejecutar el Modo Privado (Søren Writer):**
    *   Para iniciar la CLI interactiva, conéctate al contenedor de `soren-mirror`:
    ```bash
    docker-compose exec soren-mirror npm start
    ```

## 📄 Licencia
Este proyecto es una exploración personal. Si te sirve, úsalo. Si te asusta, déjalo.