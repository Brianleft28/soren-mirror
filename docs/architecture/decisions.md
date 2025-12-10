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

## ⚖️ ADR-009: Coeficientes de Fricción Emocional (Contextual Stress)
* **Estado:** Aceptado.
* **Contexto:** Medir el estrés linealmente es inconsistente. Temas burocráticos agotan más rápido que temas técnicos.
* **Decisión:** Implementar **"Fricción Variable"** en el `StressManager`.
* **Fórmula:** $\Delta S = \text{CargaBase} \times \text{FricciónDelTema}$
    * *Ejemplo:* `Código: 0.2` (Baja fricción, permite flow largo).
    * *Ejemplo:* `Trámites: 0.9` (Alta fricción, alerta temprana).