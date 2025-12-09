# Portfolio Interactivo v2 (Søren Público)

Este proyecto es la cara visible del monorepo: una aplicación web construida con **SvelteKit** que funciona como el portfolio personal de Brian Benegas. Su característica principal es la integración de **"Søren Público"**, un asistente de IA que responde preguntas sobre el perfil y los proyectos del autor.

El asistente se ejecuta de forma local y privada, utilizando un contenedor Docker con **Ollama** para garantizar que no haya dependencia de APIs externas para su función principal.

### Stack Tecnológico

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

---

## 🎯 Arquitectura y Flujo de Datos del Chat

Este servicio (`portfolio`) es el frontend del proyecto, pero gracias a SvelteKit, también tiene su propio backend para manejar la lógica de la API. El flujo de una consulta al chat es el siguiente:

1.  **Frontend (Componente Svelte)**: El usuario envía un mensaje desde la interfaz web. La UI hace una petición `POST` a su propio backend en `/api/chat`.

2.  **Backend (API Route - `src/routes/api/chat/+server.ts`)**: Este es el orquestador de la respuesta.
    *   Recibe el mensaje del usuario.
    *   Carga la personalidad base desde `../../docs/vision/public_persona.md`.
    *   Dependiendo de la pregunta, carga contexto adicional desde los archivos en `../../docs/context/` o `../../docs/proyectos/`.
    *   Construye un *System Prompt* completo y detallado.
    *   Realiza una llamada `fetch` al servicio de Ollama (`soren_brain`), que se ejecuta en otro contenedor pero dentro de la misma red de Docker.

3.  **Cerebro IA (`ollama` service)**: El contenedor de Ollama recibe la petición, procesa el prompt con el modelo `dolphin-mistral` y genera una respuesta.

4.  **Respuesta al Usuario**: La respuesta viaja de vuelta a través del backend de SvelteKit hasta la interfaz de usuario, donde se muestra al usuario.

Este diseño permite que el portfolio sea una aplicación autocontenida que consume la inteligencia del "cerebro" local, manteniendo la separación de responsabilidades.

---

## 🚀 Desarrollo Local

Para levantar este servicio junto con su dependencia (Ollama):

1.  **Asegúrate de estar en la raíz del monorepo**, no dentro del directorio `portfolio`.
2.  **Configura las variables de entorno** creando un archivo `.env` en la raíz, basado en `.env.example`.
3.  **Ejecuta Docker Compose:**
    ```bash
    docker-compose up -d --build
    ```
4.  **Accede a la aplicación:** El portfolio estará disponible en `http://localhost:3000`.

---

## 📄 Documentación Profunda

Este `README.md` es un resumen técnico. Para una visión completa del proyecto, incluyendo decisiones de arquitectura (ADRs) y el manifiesto completo, consulta la documentación en el directorio `docs/` del repositorio principal.

-   **[Ver Documentación del Proyecto Portfolio](../../docs/proyectos/portfolio.md) 
**// filepath: portfolio/README.md **