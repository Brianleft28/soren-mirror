import { GoogleGenerativeAI } from '@google/generative-ai';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

// Importamos el archivo de memoria como texto crudo usando Vite
// Ajusta la cantidad de '../' según la estructura final, esto asume src/routes/api/chat/
import memoryContent from '../../../../static/data/public_memory.md?raw';

const MODEL_NAME = 'gemini-1.5-flash';
const LIMIT_PER_IP = 15; 

const interactions: Record<string, number> = {};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    // 1Rate Limiting Simple
    const clientIp = getClientAddress();
    const currentUsage = interactions[clientIp] || 0;

    if (currentUsage >= LIMIT_PER_IP) {
        return json({
            response: "🛑 [SISTEMA] Límite de consultas alcanzado para tu IP. Para continuar la charla, sentite libre de contactarme directamente."
        });
    }

    try {
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ FATAL: No se encontró GEMINI_API_KEY en las variables de entorno.");
            return json({ response: "Error del sistema: Credenciales de IA no configuradas." });
        }

        const { prompt } = await request.json();

        if (!prompt) {
             return json({ response: "Error: No se recibió ningún mensaje." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // Inyectamos toda la memoria estática en cada petición (Stateless)
        const fullPrompt = `
        ${memoryContent}

        ---
        CONTEXTO DE LA SESIÓN:
        El usuario es un visitante del portfolio (posible reclutador o colega).

        MENSAJE DEL USUARIO:
        "${prompt}"

        TU RESPUESTA (Responde como Søren, mantén el formato texto plano para terminal):
        `;

        // 3. Generación
        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();

        // Actualizar contador de uso
        interactions[clientIp] = currentUsage + 1;

        return json({ response: responseText });

    } catch (error) {
        console.error('[GEMINI API ERROR]', error);
        return json({ response: "Error de conexión con el núcleo cognitivo. Por favor, intenta nuevamente en unos segundos." });
    }
};