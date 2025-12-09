![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-000000?style=for-the-badge&logo=ollama&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-WIP-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)

# 🪞 Søren Mirror: Sistema Operativo para la Mente Neurodivergente

> *"No soy un bot corporativo. Soy tu espejo con memoria y empatía."*

**Søren Mirror** es una plataforma de agentes autónomos diseñada para actuar como un **Segundo Cerebro**. Su arquitectura híbrida (Nube + Local) permite gestionar la escritura creativa, la arquitectura de software y la regulación emocional, todo bajo un entorno de privacidad estricta.

---

## 🎭 El Sistema Multi-Personalidad

Søren no es una sola voz. El sistema cambia de "máscara" según tu necesidad cognitiva del momento:

### 1. 🏗️ Søren Architect (Modo "Søren Code")
* **Perfil:** Hacker "Black Hat", Arquitecto de Software Senior y pragmático.
* **Estilo:** Rioplatense, técnico, cínico y directo.
* **Misión:** Resolver deuda técnica, criticar código spaghetti y proponer arquitecturas escalables. "Si el código es basura, te lo digo".

### 2. ✒️ Søren Writer (Modo "El Editor")
* **Perfil:** Editor literario existencialista de bar nocturno.
* **Estilo:** Melancólico, profundo y empático.
* **Misión:** Transformar el dolor en arte. Utiliza técnicas de mayéutica para desbloquear la escritura creativa, ficcionando la realidad del usuario.

### 3. 🌐 Søren Public (Modo "Portfolio")
* **Perfil:** Interfaz pública (estilo *Mr. Robot*).
* **Misión:** Presentar al creador (Brian) ante el mundo exterior/reclutadores, protegiendo los datos sensibles.

---

## 🧠 Núcleo Cognitivo (TDAH Friendly)

El sistema está diseñado específicamente para mitigar síntomas de neurodivergencia:

* **⏳ Chronos (Ceguera Temporal):** Gestión de fatiga estocástica. Calcula probabilidades de agotamiento en lugar de usar timers rígidos.
* **🔥 StressManager (Desregulación Emocional):** Monitorea la "temperatura" del chat y predice picos de estrés basados en historial.
* **📂 ProjectManager (Permanencia de Objeto):** Mantiene vivos los contextos de los proyectos aunque no los veas.


---
## 🚧 Roadmap: La Expansión Móvil (En Desarrollo)

El sistema está evolucionando hacia una arquitectura omnicanal. El próximo hito es la integración total con **Telegram Bot API**.

* **📱 Søren en tu Bolsillo:** Portabilidad del 100% de las funcionalidades del CLI a una interfaz de chat móvil.
* **🔐 Auth Remota:** Sistema de Login seguro vía Telegram para acceder a las personalidades privadas (Writer/Architect) desde cualquier lugar.
* **☁️ Sincronización:** Posibilidad de iniciar un borrador ("draft") en el móvil mientras caminas y terminarlo en la PC con el CLI.
* **🔔 Notificaciones de Estrés:** Si *Chronos* detecta fatiga, Søren te enviará un mensaje proactivo al celular sugiriendo un descanso.


## 📚 Documentación Técnica

Para entender la ingeniería detrás del espejo:

* **📖 [Manifiesto Técnico y Funcional](docs/soren-mirror/technical-manifesto.md)**: Explicación detallada de las variables medibles y el enfoque clínico/técnico.
* **🗺️ [Arquitectura de Flujo de Datos](docs/soren-mirror/architecture/proyect-system.md)**: Diagrama visual (Mermaid) de cómo viaja la información desde el CLI hasta el almacenamiento seguro.

---

## 🔒 Privacidad y "Búnker" de Datos

Tus historias, traumas y códigos privados **NUNCA** salen de tu máquina sin tu permiso explícito.
El sistema crea una estructura de archivos aislada por usuario:

```bash
data/users/{tu-apodo}/
├── projects/
│   └── {nombre-novela}/
│       ├── draft.md       # El cuerpo (lo que escribes)
│       ├── memory.md      # El alma (contexto emocional/privado)
│       ├── style.md       # La voz (instrucciones de tono)
│       └── metadata.json  # La estructura lógica
---
```
## 🚀 Instalación y Uso

### Requisitos
*   Docker & Docker Compose
*   Node.js v20+
*   Una API Key de Google Gemini
*   (Opcional) GPU para correr Ollama localmente

### Despliegue Rápido

**1. Clonar y Configurar:**
````bash
git clone https://github.com/brianleft28/soren-mirror.git
cd soren-mirror
cp .env.example .env
# Edita el archivo .env con tus credenciales