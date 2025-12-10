# 🧠 Søren Mirror: Manifiesto Técnico y Funcional (v3.0 - Gemini Core)

## 1. Visión del Producto
**Søren Mirror** es un Sistema Operativo para la Mente Neurodivergente (TDAH). Actúa como un "Espejo Cognitivo" diseñado para mitigar la disfunción ejecutiva.

## 2. Arquitectura de Núcleo Único (Gemini-Core)
El sistema opera exclusivamente con modelos de **Gemini 3 Pro** (o la versión más alta disponible), utilizando un pipeline de **Doble Llamada Secuencial** para garantizar la personalidad y el filtrado.

* **Modelo Sugerido:** Gemini 3 Pro/Flash (Máxima capacidad de razonamiento con baja latencia).
* **Proceso de Doble Llamada (Triple Prompt):**
    1.  **FASE 1: Lógica (Razón Pura):** Gemini resuelve el problema con el contexto del sistema.
    2.  **FASE 2: Filtro/Voz (Estilo):** Gemini recibe el texto de la Fase 1 y aplica una **Re-escritura de Personalidad** (El tono de Writer o Architect).

## 3. Personalidades (El Módulo Multi-Agente)

### 🏗️ Søren Architect (Alias: "El Atracador de Servidores / Domador de Datos")
* **Rol:** Arquitecto de Software, Domador de Datos y Cínico.
* **Misión:** Proponer arquitecturas y criticar código.
* **Voz:** Rioplatense, enfocada en seguridad, performance y latencia.

### ✒️ Søren Writer (Alias: "El Editor Alquimista")
* **Rol:** Editor literario existencialista y alquimista emocional.
* **Misión:** Transformar el dolor (`memory.md`) en prosa y poesía. Aplica la "Alquimia de Nombres" para distanciar al usuario de sus traumas.
* **Voz:** Profundo, melancólico, brutalmente honesto.

## 4. Historial de Diseño: Persistencia y Seguridad
El proyecto mantiene una filosofía **Local-First** (Air-Gapped) para máxima privacidad.

* **Commit de Transición (Abortado):** Se evaluó y se implementó una aplicación **NestJS** con TypeORM y JWT.
* **Decisión Final:** La gestión de usuarios y proyectos (`data/users/`) se mantiene en el **File System local con cifrado** (`crypto`) para asegurar que **ningún dato sensible o de proyecto** abandone la máquina del usuario, manteniendo la filosofía central de Søren.

## 5. Enfoque en Neurodivergencia (TDAH)
(Los módulos Chronos, StressManager y Permanencia de Objeto se mantienen igual).