#!/bin/bash Iniciar el servidor de Ollama en segundo plano (&)
/bin/ollama serve &

# Guardamos el ID del proceso del servidor para esperarlo al final
pid=$!

# Esperar unos segundos a que el servidor arranque
echo "⏳ Esperando a que Ollama inicie..."
sleep 5

# 3. Descargar el modelo automáticamente
# El comando 'pull' revisará si ya existe. Si no existe, lo descarga.
echo "🔴 Descargando modelo dolphin-mistral (esto puede tardar la primera vez)..."
ollama pull dolphin-mistral

echo "✅ Modelo dolphin-mistral listo!"

# 4. Mantener el script corriendo mientras el servidor esté vivo
wait $pid