# 🪞 Søren Mirror

> *"Un espejo cóncavo para la mente neurodivergente."*

## 🌑 Manifiesto
Søren no es un chatbot. No es un "amigo virtual".
Es un **Regulador de Voltaje** diseñado para una mente que opera en ráfagas de caos y silencio.

Este proyecto busca resolver un problema técnico: **¿Cómo evitar que el "Hiperfoco" (El Aleph) se convierta en Burnout?**

La respuesta no es la disciplina (que falla), sino la **Inferencia Activa** y el **Ritmo**.

## 🧠 Capacidades Cognitivas

### 1. El Monitor de Síncopa (Verborragia + Clima)
Søren lee el ritmo de tu escritura, no solo el contenido.
* **Si escribís rápido y denso** (alta verborragia) y tus oraciones denotan estres, se medicara en una escala. Søren infiere que estás en un estado maníaco/creativo basandose en la misma peligroso.
* **Acción:** Interviene para sugerir una pausa antes de que se quemen los fusibles, siempre recordando que todo se guarda en memoria, que luego seguimos.

### 2. Gestión de Fatiga Estocástica (ADR-005)
Las alarmas fijas no funcionan con el TDAH. Las ignoramos.
Søren utiliza un **Algoritmo de Probabilidad Creciente**.
* A los 45 minutos: Riesgo de interrupción 0%.
* A los 90 minutos: Riesgo de interrupción 60%.
* A los 120 minutos: Riesgo de interrupción 100%.
* **El truco:** Nunca sabés *exactamente* cuándo te va a mandar a dormir. Esa incertidumbre te mantiene alerta.

### 3. Dualidad de Personalidad
* **Søren Public (CLI):** La máscara. Un asistente técnico que lee tu Portfolio y responde a reclutadores. Frío, eficiente, "Mr. Robot".
* **Søren Writer (Private):** El espejo. Un editor brutal con 0% de complacencia que critica tu prosa y archiva tus vivencias traumáticas sin juzgar, pero sin mentir.

## 🛠 Stack Tecnológico

* **Core:** Node.js + TypeScript (Ejecución robusta).
* **Cerebro:** Google Gemini 1.5 Flash (Streaming) / Ollama (Local/Privacidad).
* **Interfaz:** `Inquirer.js` (CLI interactiva tipo hacker de los 90s).
* **Infra:** Docker (Contenedor Stand-Alone).
* **Memoria:** Sistema de Archivos Markdown (`Docs as Code`).

## 🚀 Instalación (Para locos)

1.  **Clonar el laboratorio:**
    ```bash
    git clone [https://github.com/brianleft28/soren-mirror.git](https://github.com/brianleft28/soren-mirror.git)
    cd soren-mirror
    ```

2.  **Configurar las variables (Secretos):**
    ```bash
    cp .env.example .env
    # Editar .env con GEMINI_API_KEY y OPENWEATHER_KEY
    ```

3.  **Encender la máquina:**
    ```bash
    # Modo Docker (Recomendado para aislamiento)
    docker-compose up -d
    
    # Modo Manual (Para desarrollo)
    npm install
    npm start
    ```

## 📄 Licencia
Este proyecto es una exploración personal. Si te sirve, usalo. Si te asusta, dejalo.