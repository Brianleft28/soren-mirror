# 🪞 Søren Mirror: Sistema Operativo Cognitivo (Neurodivergent-First)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

> *"El caos no se elimina, se indexa. La ansiedad no se calla, se procesa."*

**Søren Mirror** es una extensión digital para mentes neurodivergentes. Un sistema de "segundo cerebro" diseñado para capturar el flujo de pensamiento caótico, estructurarlo y devolver claridad. No es solo un chatbot; es una infraestructura de **regulación cognitiva**.

---

## 🎯 Estado Actual del Proyecto: Fase de Integración

Actualmente, el desarrollo se centra en fusionar la lógica del núcleo (IA) con la interfaz visual web.

* **Objetivo Inmediato:** Conectar el `Core` (Lógica en Node.js) con el `Portfolio` (SvelteKit) mediante una API intermediaria.
* **Visión:** Poder interactuar con el cerebro de Søren directamente desde la terminal web del portfolio.

---

## 🧠 Arquitectura del Sistema

El sistema se divide en tres componentes principales que interactúan entre sí:

### 1. 🧬 Søren Core (El Cerebro - Backend)
* **Ubicación:** `/soren-mirror`
* **Tecnología:** Node.js, TypeScript, Google Gemini 2.5.
* **Función:**
    * Procesamiento de Lenguaje Natural (NLP).
    * Gestión de Memoria Vectorial (RAG) y Contexto.
    * Manejo de Personalidades (Code, Writer, Architect).
    * **API Layer (En Desarrollo):** Puente HTTP para recibir comandos del frontend.

### 2. 🌐 Søren Public (La Interfaz - Portfolio)
* **Ubicación:** `/portfolio`
* **Tecnología:** SvelteKit, Tailwind, Terminal Emulation.
* **Función:**
    * **Portfolio Interactivo:** Presentación de proyectos y perfil profesional.
    * **La Consola Web:** Una terminal embebida que permite enviar comandos al *Core* (ej: "resumir mis notas de hoy", "analizar este código").
    * **Visualización:** Dashboards de métricas personales y estado del sistema.

### 3. 📱 Søren Private (El Compañero - Telegram Bot)
* **Estado:** Operativo / Mantenimiento.
* **Función:**
    * Canal de entrada de baja fricción ("Vomit Draft").
    * Captura rápida de ideas, audio y texto en movimiento.
    * Gestión de crisis y ansiedad en tiempo real.

---

## 🔄 Flujo de Datos (The Loop)

1.  **Input:** El usuario ingresa un comando en la **Consola Web** (Søren Public) o un mensaje en **Telegram** (Søren Private).
2.  **Procesamiento:** La **API Intermediaria** recibe el input y lo pasa al **Agente Orquestador** del Core.
3.  **Razonamiento:** El Core consulta la **Memoria (RAG)** y decide qué personalidad debe responder (Code, Writer, etc.).
4.  **Output:** La respuesta se devuelve a la interfaz correspondiente (Terminal Web o Chat de Telegram).

---

## 🛠️ Stack Tecnológico

* **Frontend:** SvelteKit + Vite (Renderizado rápido y reactivo).
* **Backend:** Node.js + TypeScript (Lógica robusta).
* **IA:** Google Gemini 2.5 Flash (Razonamiento y Generación).
* **Base de Datos/Memoria:** Sistema de archivos local (Markdown/JSON) + Vector Store (para RAG).

---

## 🚀 Roadmap Corto Plazo

- [x] Estructura base del Monorepo.
- [x] Implementación básica de Agentes (Console, Telegram).
- [x] UI del Portfolio con emulador de Terminal.
- [ ] **Crear API Server en `soren-mirror` (Express/Fastify).**
- [ ] **Conectar `portfolio/api/chat` con `soren-mirror/api`.**
- [ ] Desplegar versión Alpha de Søren Public.

---

## 🔒 Filosofía Local-First

Tus datos son tuyos. El sistema prioriza el almacenamiento local y la privacidad, asegurando que tu contexto personal y profesional permanezca bajo tu control.

## Arquitectura y Filosofía
Para entender por qué tomamos estas decisiones y el propósito de los 3 Cores, leer obligatoriamente:

👉 **[El Manifiesto de Arquitectura](./docs/arch/MANIFESTO.md)**

> "Un sistema sin filosofía es solo código legacy en espera."