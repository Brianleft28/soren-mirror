## 🧠 ADR-005: Gestión de Fatiga mediante Probabilidad Estocástica

### Contexto
El usuario (Brian) padece TDAH. Los sistemas tradicionales de gestión de tiempo (ej: "Pomodoro fijo de 25 min") fallan porque interrumpen el *hiperfoco* de manera arbitraria, generando frustración, o permiten sesiones de *burnout* de 4 horas sin aviso.

### Decisión
Implementar un algoritmo de **Interrupción Estocástica Creciente** en el agente Søren.

### Definición Técnica
En lugar de un límite de tiempo rígido (determinista), utilizamos una función de probabilidad lineal.
- **Variable Independiente:** Tiempo de sesión ($t$).
- **Variable Dependiente:** Probabilidad de interrupción ($P$).

$$P(t) = \frac{t - 45}{120 - 45}$$

Donde $t$ es el tiempo en minutos.

### ¿Por qué? (Rationale)
1.  **Mímesis Biológica:** La fatiga cognitiva no ocurre de golpe; es un degradado. El sistema imita el agotamiento progresivo de los neurotransmisores.
2.  **Factor Sorpresa:** Al ser aleatorio (dentro de la curva de riesgo), el usuario no puede "predecir" al bot para ignorarlo. La incertidumbre genera mayor atención a la alerta cuando ocurre.
3.  **Protección de Hiperfoco:** En la fase temprana (45-60 min), la probabilidad es baja, permitiendo que el *flow* continúe si es productivo, pero aumentando el riesgo a medida que el costo cognitivo sube.

### Futuras Mediciones (Roadmap)
Planeamos integrar **Análisis de Sentimiento** como variable ponderada. Si el usuario escribe con ira (detectada por NLP), la curva de probabilidad se acelerará ($t$ * 1.5), asumiendo que el estrés emocional agota la batería mental más rápido.