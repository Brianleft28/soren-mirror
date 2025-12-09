# Registro de Decisiones de Arquitectura (ADR)

## 🏗 ADR-001: Arquitectura Stand-Alone
* **Estado:** Aceptado.
* **Decisión:** Separar `soren-mirror` del portfolio.
* **Motivo:** El agente requiere dependencias pesadas (Puppeteer para scraping, TensorFlow.js para futuro análisis de sentimiento local) que no deben ensuciar el frontend SvelteKit.

## ⛈️ ADR-002: Inferencia de Estado "El aleph" (Síncopa)
* **Estado:** En desarrollo.
* **Contexto:** El autor entra en estados de hiperestimulación (verborragia extrema) que preceden al burnout.
* **Decisión:** Implementar un **Monitor de Síncopa** que cruce dos señales en tiempo real:
    1.  **Estres:** Datos de OpenWeatherMap (Presión baja/Tormenta = Mayor riesgo de manía).
    2.  **Conductual:** Análisis de densidad de tokens por minuto en el input.
* **Acción:** Si (Verborragia Alta) + (Estres) -> Activar protocolo de calma.

## 🎲 ADR-005: Gestión de Fatiga mediante Probabilidad Estocástica
* **Estado:** Aceptado (Core Feature).
* **Contexto:** Los temporizadores fijos (Pomodoro) fallan con el TDAH porque interrumpen el flujo arbitrariamente o son ignorados por costumbre.
* **Decisión:** Implementar un algoritmo de **Interrupción Estocástica Creciente**.
* **Fórmula:**
    $$P(t) = \frac{t - 45}{120 - 45}$$
    *(Donde $t$ es el tiempo en minutos. Antes de los 45 min, la probabilidad es 0. A los 120 min, es 1.)*
* **Rationale:**
    1.  **Mímesis Biológica:** Imita el agotamiento progresivo de los neurotransmisores.
    2.  **Factor Sorpresa:** La incertidumbre genera dopamina y mantiene la atención sobre la alerta. Evita la "ceguera de alarma".