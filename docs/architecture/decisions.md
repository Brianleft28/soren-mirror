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

# ADR-006: Migración a Microservicio de Autenticación y Persistencia SQL

## Estado
Propuesto

## Contexto
Actualmente, Søren Mirror gestiona la identidad, los proyectos y el estrés mediante archivos planos (JSON/Markdown) en el sistema de archivos local (`/data`).
Esto presenta limitaciones:
1. **Concurrencia:** No es seguro para escrituras simultáneas.
2. **Seguridad:** Las credenciales y datos sensibles están en texto plano o dependen del acceso al disco.
3. **Reutilización:** El Portfolio Web no puede acceder a los datos del CLI fácilmente sin exponer el sistema de archivos.

## Decisión
Se decide desacoplar la lógica de persistencia y autenticación en un microservicio dedicado.

### Stack Tecnológico:
1. **Backend:** NestJS (Framework de Node.js progresivo).
2. **Base de Datos:** MySQL 8.0 (Relacional, para usuarios, logs de estrés y metadatos de proyectos).
3. **ORM:** Prisma o TypeORM (Para manejo de tipos seguros).
4. **Auth:** JWT (Json Web Tokens) para sesiones stateless compartidas entre CLI y Web.

## Consecuencias
### Positivas
* **Centralización:** Un solo lugar para gestionar usuarios y permisos.
* **Escalabilidad:** El Portfolio y el CLI consumirán la misma API. Si mejoramos el auth, mejoran ambos.
* **Seguridad:** Los passwords estarán hasheados (bcrypt).

### Negativas
* **Complejidad:** Requiere levantar contenedores Docker para MySQL y el Servicio NestJS.
* **Refactor:** Hay que reescribir `ProjectManager` y `IdentityManager` en el CLI para que hagan peticiones HTTP en lugar de `fs.writeFileSync`.