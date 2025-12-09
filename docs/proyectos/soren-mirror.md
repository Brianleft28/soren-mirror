# 🧠 Søren Mirror: Manifiesto Técnico y Funcional

## 1. Visión del Producto
**Søren Mirror** es un Sistema Operativo para la Mente Neurodivergente.
Actúa como un "Espejo Cognitivo" y compañero de *Body Doubling* digital, diseñado para mitigar la disfunción ejecutiva mediante una arquitectura híbrida de IA (Lógica + Emoción).

## 2. Enfoque en Neurodivergencia (TDAH)
El sistema ataca tres síntomas clínicos específicos mediante módulos de software:

### A. Ceguera Temporal (Time Blindness)
* **Problema:** Dificultad para sentir el paso del tiempo o saber cuándo detenerse (Hiperfoco tóxico).
* **Solución (Módulo `Chronos`):** No usa temporizadores rígidos. Implementa una probabilidad estocástica de interrupción que aumenta con el tiempo.
* **Variables Medibles (Pre-parametrizables):**
    * `session_duration_minutes`: Tiempo real transcurrido.
    * `fatigue_probability`: (0.0 - 1.0) Cálculo dinámico de riesgo de agotamiento.
    * `soft_limit` / `hard_limit`: Umbrales de intervención (ej: 45m / 120m).

### B. Desregulación Emocional (RSD)
* **Problema:** Reacciones intensas a la frustración o rechazo percibido (Disforia Sensible al Rechazo).
* **Solución (Módulo `StressManager`):** Monitorea la "temperatura" del chat.
* **Variables Medibles:**
    * `current_stress_level` (0-10): Nivel calculado en base a velocidad de tipeo y uso de mayúsculas.
    * `decay_rate`: Tasa de recuperación (enfriamiento) por segundo de silencio.
    * `predicted_stress`: Predicción basada en historial (JSON) por día/hora.

### C. Permanencia de Objeto (Object Permanence)
* **Problema:** "Si no lo veo, no existe". Olvidar proyectos o contextos emocionales al cerrar la laptop.
* **Solución (Módulo `ProjectManager`):** Sistema de archivos persistente que mantiene vivo el contexto emocional (`memory.md`) separado del trabajo técnico (`draft.md`).

## 3. Arquitectura Híbrida (Doble Núcleo)
* **Nube (Gemini 1.5):** Procesamiento lógico pesado, análisis de estructura y generación de ideas complejas.
* **Local (Ollama/Dolphin):** Filtro de personalidad, privacidad y "traducción" emocional (Rioplatense, Crudo).

## 4. Estructura de Datos Real (El "Búnker")
Cada usuario tiene un entorno aislado (`Sandbox`) en disco, protegido por autenticación local:
```bash
data/users/{usuario}/
├── projects/
│   └── {nombre_proyecto}/
│       ├── draft.md       # (El cuerpo de la obra)
│       ├── memory.md      # (El alma/contexto vital y hechos reales)
│       ├── style.md       # (La voz/tono deseado: Jazz, Crudo, etc.)
│       └── metadata.json  # (La estructura lógica y capítulos)
└── metrics/
    └── {usuario}_stress_log.json
```
## 5. Las Personalidades (Sistema Multi-Agente)
El sistema no tiene una sola voz. Cambia de "máscara" según la necesidad cognitiva del usuario.

### 🏗️ Søren Architect (Alias: "Søren Code")
*   **Rol:** Ingeniero de Software Senior & Hacker "Black Hat".
*   **Personalidad:** Pragmático, técnico y Rioplatense. Usa lunfardo ("che", "boludo", "quilombo").
*   **Misión:** Resolver problemas técnicos sin vueltas. Si el código es basura, lo dice. Si hay que romper seguridad, lo hace (sin censura corporativa).
*   **Ideal para:** Sesiones de código intenso, debugging y arquitectura.

### ✒️ Søren Writer (Alias: "El Editor")
*   **Rol:** Editor literario existencialista y compañero de trinchera.
*   **Personalidad:** Profunda, melancólica, de "Bar Notable" a las 3 AM.
*   **Misión:** Transformar el dolor en arte. Lee el archivo `memory.md` (tus traumas/vivencias) y te empuja a ficcionarlos.
*   **Ideal para:** Bloqueo de escritor, catarsis emocional y desarrollo de novelas.

### 🌐 Søren Public (Alias: "El Embajador")
*   **Rol:** Interfaz pública para el Portfolio Web.
*   **Personalidad:** Profesional, misteriosa (estilo Mr. Robot), pero accesible.
*   **Misión:** Vender el perfil profesional de Brian a reclutadores. Lee `personal_profile.md`.
*   **Ideal para:** Visitas externas y demostración técnica.
## 6. Interfaces y Accesibilidad (Roadmap)

Para maximizar la adherencia al sistema en cerebros con TDAH (que requieren inmediatez y baja fricción), se está desarrollando una interfaz móvil.

### 📱 Módulo Telegram Gateway (WIP)
* **Objetivo:** Eliminar la barrera de "sentarse en la PC" para interactuar con el Segundo Cerebro.
* **Funcionalidad:**
    * **Mirroring del CLI:** Replica la experiencia de la terminal (Inquirer) mediante menús interactivos y comandos de Telegram.
    * **Autenticación Segura:** Middleware de Login que vincula el `chat_id` de Telegram con el `userId` local del sistema de archivos (`data/users/`).
    * **Modo "Quick Note":** Permite enviar notas de voz o texto rápido que se anexan automáticamente al `memory.md` del proyecto activo sin abrir el editor completo.