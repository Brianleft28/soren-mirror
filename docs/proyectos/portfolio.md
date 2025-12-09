# Resumen Técnico: Portfolio Interactivo v2

## Concepto Principal: Un Explorador de Archivos Simulado

El portfolio no es una página web tradicional con menús de navegación. Su interfaz de usuario imita deliberadamente un explorador de archivos de un sistema operativo simple. El objetivo es presentar la información (proyectos, perfil, etc.) de una manera estructurada y familiar para un público técnico.

Esta navegación se gestiona de forma declarativa. No hay scripts complejos de renderizado de árboles en el cliente. La estructura de "archivos" y "carpetas" está predefinida en el código, y la interfaz simplemente renderiza el estado actual, haciendo la experiencia ligera y rápida.

## Arquitectura y Flujo de Datos del Chat

El proyecto es una aplicación **SvelteKit** que contiene tanto el frontend como un backend de API, orquestado dentro de un entorno **Docker**.

Cuando un usuario interactúa con el asistente "Søren Público", el flujo es el siguiente:

1.  **Frontend (SvelteKit):** El componente de chat envía la pregunta del usuario a la ruta de API interna `/api/chat`.
2.  **Backend (API Route):** Este es el cerebro orquestador.
    *   Carga la personalidad de Søren desde `docs/vision/public_persona.md`.
    *   Carga contexto técnico relevante (como este mismo documento o el perfil del autor) desde el directorio `docs/`.
    *   Construye un *System Prompt* completo.
    *   Envía este prompt al servicio **Ollama** (`soren_brain`), que se ejecuta en un contenedor Docker separado pero conectado por la misma red.
3.  **Cerebro IA (Ollama):** El servicio Ollama procesa la solicitud usando el modelo `dolphin-mistral` y genera una respuesta basada estrictamente en el contexto proporcionado.

## Stack Tecnológico

-   **Framework:** SvelteKit con TypeScript.
-   **Estilos:** CSS nativo, sin frameworks de UI pesados.
-   **Cerebro IA:** Contenedor Docker con Ollama.
-   **Orquestación:** Docker Compose.