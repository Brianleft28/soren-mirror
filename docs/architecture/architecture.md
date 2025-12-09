# 🏛 Arquitectura de Søren Mirror (Ecosistema)

## 1. Visión General
El ecosistema "Søren Mirror" se divide en dos contextos de ejecución claramente diferenciados por su propósito y nivel de privacidad.

### A. Søren Public CLI 
* **Identidad:** Definida estrictamente en `docs/vision/public_persona.md`.
* **Propósito:** Interfaz pública de terminal para reclutadores y visitantes técnicos.
* **Comportamiento:** Profesional, técnico, levemente reservado ("Estilo Mr. Robot"). No habla de terapia ni de crisis personales profundas.
* **Fuente de Datos:** Consume `portfolio/src/lib/data/file-system.ts` para explicar proyectos.
* **Modo:** Quemado (Hardcoded). No es seleccionable.

### B. Søren Writer (Futuro - Private)
* **Identidad:** Terapeuta / Editor Socrático.
* **Propósito:** Asistente personal de Brian para escritura y salud mental.
* **Comportamiento:** 0% Complacencia, analítico, emocionalmente crudo.
* **Fuente de Datos:** Archivos privados, logs de chat, `read.ai`.

## 2. Flujo de Datos (Søren Public)

1.  **Inicialización:**
    * El sistema carga `docs/vision/public_persona.md` como *System Instruction* inmutable.
    * Se monta el `FileSystem` (espejo del Portfolio).

2.  **Interacción (Loop):**
    * **Navegación:** El usuario usa `inquirer` para seleccionar una carpeta o proyecto del FileSystem.
    * **Inyección de Contexto:** Al entrar en un proyecto (ej: "Søren Mirror"), el contenido técnico de ese archivo se suma temporalmente al prompt.
    * **Chat:** El usuario pregunta. Søren responde filtrado por la *Public Persona*.

## 3. Estructura de Archivos Clave
* `src/core/persona-loader.ts`: Utilidad para leer el markdown de visión.
* `interactive-soren.ts`: Entry point del CLI Público.