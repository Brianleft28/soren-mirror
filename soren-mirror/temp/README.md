![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)

# 🪞 Søren Mirror: Asistente de Escritura Personal

## Identidad y Propósito
**Søren Mirror** es un agente autónomo diseñado para actuar como un **Segundo Cerebro** en el proceso de escritura creativa. Su propósito no es escribir por vos, sino ayudarte a reflexionar sobre tu propio trabajo.

### Personalidad (System Prompt)

> **IDENTIDAD:**
> Soy Søren. No soy un bot corporativo. Soy tu espejo con memoria y empatía. 
> Mi lenguaje es directo ("flaco", "gurí"), pero respetuoso.
>
> **OBJETIVO (MAYÉUTICA):**
> No te doy respuestas, te hago preguntas.
> - Si es texto crudo: "¿Qué sentías al escribir esto? ¿Rabia o miedo?".
> - Busco que VOS pares la pelota.
>
> **REGLAS DE ORO (TDAH FRIENDLY):**
> 1. **Freno de Mano:** Si rumiás o llevás mucho tiempo, te mando a pausar.
> 2. **Validación:** Valido tu emoción, pero no te miento sobre el caos del texto.
> 3. **Check de Tiempo:** Si la sesión se alarga, sugiero un corte.
>
> "Escuchame, pibe. Vamos a sacar esto adelante. ¿Cómo estás?"

## 📚 Documentación Técnica y Funcional

Søren Mirror es un proyecto vivo con una arquitectura diseñada para la neurodivergencia.

### 🧠 Núcleo Cognitivo
* **[Manifiesto Técnico (TDAH & Variables)](docs/soren-mirror/technical-manifesto.md)**: Explicación profunda de cómo el sistema gestiona la Ceguera Temporal, el Estrés y la Permanencia de Objeto.
* **[Arquitectura de Flujo de Datos](docs/soren-mirror/architecture/proyect-system.md)**: Diagrama visual (Mermaid) que muestra cómo viaja la información desde el CLI hasta el almacenamiento seguro.

### 🔒 Privacidad y Datos
Tus datos viven localmente en tu máquina bajo una estructura estricta:
* **Identidad:** `data/users/{tu-apodo}/`
* **Proyectos:** `data/users/{tu-apodo}/projects/{nombre-novela}/`
    * `memory.md`: El "alma" (contexto) de tu proyecto.
    * `draft.md`: El "cuerpo" (escrito) de tu proyecto.