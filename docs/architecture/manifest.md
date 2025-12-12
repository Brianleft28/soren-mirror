# 📜 El Manifiesto de Arquitectura: La Mente Bicameral

> **Premisa:** El TDAH no es un déficit de atención, es un déficit de regulación ejecutiva. El software que construyo, debe actuar como esa corteza prefrontal externa.

---

## 1. La Separación: ¿Por qué Søren Public vs. Søren Core?

Una de las decisiones más críticas (y confusas al principio) es separar el proyecto en dos entidades físicas distintas (`/portfolio` y `/soren-mirror`). Esto no es un capricho, es una necesidad de supervivencia del sistema.

### A. El Principio de la Máscara Desechable
Tu **Portfolio (SvelteKit)** es tu cara pública. Debe ser:
* Rápido (Edge delivery).
* Estéticamente agradable.
* Públicamente accesible.
* **Reemplazable.**

Tu **Core (Node.js)** es tu mente. Debe ser:
* Privado.
* Persistente.
* Complejo.
* **Eterno.**

Si mañana decides que Svelte ya no te gusta y quieres reescribir tu portfolio en React, Vue o Astro, **tu "alma" digital (memorias, patrones, lógica)** no debería morir ni ser reescrita. Al separar el Core, garantizamos que la inteligencia sobreviva a la tecnología de la interfaz.

### B. Latencia vs. Profundidad

* **Søren Public** corre en el navegador/edge. Su prioridad es renderizar píxeles en milisegundos.
* **Søren Core** corre en un servidor/local. Su prioridad es **pensar**. Pensar toma tiempo.
Separarlos nos permite que la UI no se congele mientras el cerebro está "meditando" una respuesta compleja o indexando un PDF.

---

## 2. La API como "Cuerpo Calloso"

En el cerebro humano, el cuerpo calloso conecta los hemisferios. En nuestra arquitectura, la **API Intermediaria** cumple esa función.

No queremos que el Portfolio tenga acceso directo a la base de datos de tus pensamientos (archivos locales).
* El Portfolio envía una **intención** ("El usuario preguntó esto").
* La API recibe, autentica y decide si esa intención requiere acceso a la memoria profunda.
* Esto previene que un error en el frontend exponga accidentalmente tu "Journal de Ansiedad" al internet público.

---

## 3. Las Tres Personalidades (Regulación de Contexto)

El TDAH sufre con el *Context Switching* (cambio de contexto). Søren lo automatiza mediante agentes especializados:

1.  **Code (El Arquitecto):** Frío, técnico, cínico. Para cuando necesitas precisión y bash scripts.
2.  **Writer (El Filósofo):** Empático, abstracto, verboso. Para cuando necesitas desbloquearte creativamente.
3.  **Architect (El Gestor):** Estructurado, orientado a metas. Para cuando necesitas saber qué diablos tenías que hacer hoy.

No es esquizofrenia digital; es **encapsulamiento de preocupaciones**. Al invocar a un agente específico, precargamos el contexto necesario y descartamos el ruido, ayudando al usuario a enfocarse en una sola modalidad a la vez.

---

## 4. Conclusión

Søren Mirror no es una página web con un chatbot.
Es un servidor de inteligencia (Core) que *casualmente* tiene una página web (Public) como una de sus terminales.

> **"Construyo el sistema desde afuera para ordenar el sistema adentro."**