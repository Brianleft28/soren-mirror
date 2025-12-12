# Registro de Decisiones de Arquitectura (ADR)

## 🏗 ADR-001: Arquitectura Stand-Alone
* **Estado:** Aceptado.
* **Decisión:** Separar `soren-mirror` del portfolio.
* **Motivo:** El agente requiere dependencias pesadas (Puppeteer, TensorFlow.js) que no deben ensuciar el frontend SvelteKit.

## 🎲 ADR-005: Gestión de Fatiga mediante Probabilidad Estocástica (v2)
* **Estado:** Aceptado (Core Feature).
* **Cambio Conceptual:** Se abandona la teoría del "Déficit de Atención" en favor de la **"Desregulación Atencional"**.
* **Implicación:** El fallo no es la falta de foco, sino la incapacidad de regular su intensidad.
* **Decisión:** La probabilidad de interrupción es una función multivariable $P(t, c)$ donde $c$ es el contexto emocional.
* **Rationale:** Evitar la "ceguera de alarma" mediante incertidumbre (dopamina) y mímesis biológica.

## 🔌 ADR-006: Migración a Microservicio de Autenticación y SQL
* **Estado:** Implementado.
* **Decisión:** Desacoplar persistencia a un servicio NestJS + MySQL.
* **Motivo:** Resolver problemas de concurrencia en archivos planos y permitir acceso compartido (Web/CLI).

## 🎮 ADR-007: Arquitectura de "La Comandera" (Patrón Command)
* **Estado:** Aceptado.
* **Contexto:** Se requiere omnicanalidad (Telegram, CLI, Web) sin duplicar lógica.
* **Decisión:** Implementar **Dispatcher y Comandos Agmósticos**.
    1. **IChannel:** Interfaz para abstraer la salida (Consola vs Chat).
    2. **SorenCommand:** Clases aisladas para cada acción.
* **Consecuencia:** Søren puede operar en múltiples entornos manteniendo una única "memoria".

## 🧭 ADR-008: Monitor de Horizonte Semántico (Aplicado a la Manía)
* **Estado:** Aceptado.
* **Contexto:** El "Hiperfoco" puede convertirse en un bucle improductivo de micro-detalles (Manía), perdiendo la visión arquitectónica.
* **Decisión:** Implementar un sistema de **Doble Memoria (Draft vs. Memory)**.
* **Mecanismo:**
    * Si la densidad de detalles en `draft.md` supera un umbral sin actualizaciones en `memory.md`, se detecta "Pérdida de Horizonte".
* **Acción:** Søren activa el modo **"Soporte Modular Horizontal"**, bloqueando la discusión de detalles y obligando al usuario a definir estructuras abstractas antes de continuar.
# ADR-009: Implementación de Arquitectura Cognitiva RAG y Separación de Dominios

* **Estado:** Propuesto
* **Fecha:** 2025-12-11
* **Contexto:** Neurodivergencia, Gestión de TDAH, Portfolio Público.

## 1. Contexto y Problema
El sistema actual (Søren Mirror) opera reactivamente basado en logs de chat y un perfil estático. 
Se detecta la necesidad de:
1.  **Asistencia Terapéutica Activa:** El sistema debe conocer teoría clínica (ej: Russell Barkley sobre percepción del tiempo) para detectar patrones nocivos (sesiones largas, rumiación) y ofrecer consejos fundamentados, no alucinados.
2.  **Separación de Preocupaciones:** El "Caos Privado" (gestión personal/bot) se mezcla con la "Cara Pública" (Portfolio).
3.  **Identidad Dinámica:** Los saludos y el tono deben adaptarse dinámicamente al usuario y su estado, no ser strings estáticos.

## 2. Decisión Arquitectónica

Se decide evolucionar Søren Mirror hacia una **Arquitectura Híbrida RAG (Retrieval-Augmented Generation)** con separación de dominios.

### A. Núcleo Cognitivo (Søren Core)
Implementaremos un módulo `KnowledgeBase` que utilice **Embeddings de Gemini** para indexar literatura técnica (PDFs/MDs de Barkley, Clean Code, etc.) en un almacenamiento vectorial local (`vector_store.json`).
* **Trigger:** Antes de cada respuesta del `ChatCommand`, el sistema consultará este vector store si detecta palabras clave de riesgo (tiempo, dolor, bloqueo).

### B. Separación de Dominios (Public vs Private)
* **Søren Private (Telegram Bot):** Interfaz de entrada "sucia" y rápida. Gestión de estrés, draft y consolidación.
* **Søren Public (SvelteKit Portfolio):** Interfaz de salida "limpia". Consumirá únicamente archivos JSON/MD procesados y movidos a una carpeta `public_content/` mediante el comando `/publish`.

### C. Sistema de Personalidad Dinámica
Se reemplazan los prompts estáticos por un `PersonaEngine` que inyecta contexto en tiempo real:
* **Input:** `Nickname`, `Mood` (Writer/Architect), `TimeOfDay`, `StressLevel`.
* **Output:** Saludo y Tono ajustados (ej: "Che Brian, son las 3AM, ¿otra vez el código?").

## 3. Consecuencias
* **Positivas:**
    * Søren podrá citar a Barkley para justificar una interrupción de sesión.
    * El Portfolio se mantiene impoluto, leyendo datos estáticos generados por el Bot.
    * Escalabilidad: La base de conocimiento puede crecer infinitamente sin reentrenar el modelo.
* **Negativas:**
    * Aumento de latencia (1-2s extra) por la búsqueda vectorial antes de responder.
    * Requiere gestión de tokens (costo de API) para embeddings grandes.

## 4. Implementación Técnica
* Librería de Embeddings: `@google/generative-ai` (`text-embedding-004`).
* Almacenamiento Vectorial: Archivo JSON local (Simplicidad > Complejidad de DB).
* Parser de PDF: `pdf-parse` para ingestar libros.