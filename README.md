# 🪞 Søren Mirror:  Una IA que nos ayuda a autoregular nuestros tiempos y ansiedades (Neurodivergent-First)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

> *"El caos no se elimina, se indexa. La ansiedad no se calla, se procesa."*

**Søren Mirror** es una extensión digital para mentes neurodivergentes. Un sistema de diseñado para capturar el flujo de pensamiento caótico, estructurarlo y devolver claridad. No es solo un chatbot; es una infraestructura de **regulación cognitiva**.

---

## 🎯 Estado Actual: Fase de Integración ("The Bridge")

Actualmente, el desarrollo se centra en conectar el cuerpo con el cerebro.

* **Objetivo Inmediato:** Crear la API intermediaria que permita al `Portfolio` (SvelteKit) hablar con el `Core` (Node.js).
* **Visión Técnica:** Lograr que la terminal web sea una ventana real a la memoria del sistema, no una simulación.

---

## 🔭 Visión a Largo Plazo: La Prótesis Cognitiva

Más allá del código, Søren busca resolver problemas funcionales del TDAH mediante integraciones profundas:

### Combatiendo la "Ceguera Temporal" (Time Blindness)
El objetivo final es la integración con **Google Workspace (Calendar & Tasks)** para materializar el tiempo:
* **Visualización de Impacto:** No solo "ver la agenda", sino visualizar cuánto tiempo real y energía consume una tarea.
* **Bloqueo de Tiempo Asistido:** Que la IA sugiera pausas y reorganice el día cuando detecta sobrecarga cognitiva o parálisis por análisis.
* **Contexto Automático:** Que al abrir un evento en el calendario, Søren ya te entregue el contexto necesario (docs, correos previos) para no perder 15 minutos buscando "dónde dejamos esto".

---

## 🧠 Arquitectura del Sistema

El sistema opera bajo una filosofía de **Desacople Cognitivo**: La inteligencia no debe depender de la interfaz.

### 1. 🧬 Søren Core (El Alma - Backend)
* **Ubicación:** `/soren-mirror`
* **Rol:** Procesamiento, Memoria y Personalidad.
* **Tecnología:** Node.js, Gemini 2.5, Vector Store (RAG).
* **Misión:** Mantener la continuidad de la consciencia (memoria a largo plazo) independientemente de dónde te conectes.

### 2. 🌐 Søren Public (La Máscara - Portfolio)
* **Ubicación:** `/portfolio`
* **Rol:** Presentación y Consola de Mando.
* **Tecnología:** SvelteKit, Terminal UI.
* **Misión:** Una interfaz rápida, visual y limpia para interactuar con el sistema y presentar tu trabajo al mundo sin exponer tus datos privados.

### 3. 📱 Søren Private (El Compañero - Telegram)
* **Rol:** Input Rápido y Gestión de Crisis.
* **Misión:** Captura de ideas en movimiento ("Vomit Draft") y soporte emocional inmediato.

---

## 🚀 Roadmap Técnico (Corto Plazo)

- [x] Estructura Monorepo establecida.
- [x] Implementación básica de Agentes (Console, Telegram).
- [x] UI del Portfolio (SvelteKit) con emulador de Terminal.
- [ ] **Desarrollo de API Server:** Crear capa HTTP en `soren-mirror` (Express/Fastify).
- [ ] **Integración del Bridge:** Conectar `portfolio/api/chat` -> `soren-mirror/api`.
- [ ] **Refactorización de Memoria:** Unificar el acceso a archivos para que ambos sistemas lean la misma verdad.

---

## 🔒 Filosofía Local-First & Privacidad

Tus traumas, tus ideas y tu código viven en tu máquina. 
Aunque usamos modelos de IA en la nube para el razonamiento, **la memoria (tu contexto)** se almacena localmente y se inyecta solo cuando es necesario. Søren protege tu soberanía digital.

---

## 📚 Documentación Profunda

Para entender las decisiones detrás de separar el Portfolio del Core y el diseño de personalidades:

👉 **[Leer el Manifiesto de Arquitectura](./docs/architecture/architecture.md)**
👉 **[Leer el Registro de Decisiones de Arquitectura (ADR)](./docs/architecture/decisions.md)**
👉 **[Leer el Manifiesto General Del Proyecto](./docs/architecture/manifest.md)**

> ** Utilizamos los principios de Docs As Code, no se pica una linea de código hasta primero documentar"**