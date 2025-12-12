import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

// Importamos la memoria
import memoryContent from '../../../../static/data/public_memory.md?raw';

const MODEL_NAME = 'gemini-1.5-flash';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response("Error: API Key no configurada.", { status: 500 });
        }

        // 1. Obtenemos prompt y project (ahora sí lo usamos)
        const { prompt, project } = await request.json();

        if (!prompt) {
             return new Response("Error: Mensaje vacío.", { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // 2. Construcción del Prompt con Contexto
        let contextInstruction = "";
        if (project) {
            contextInstruction = `
            CONTEXTO ESPECÍFICO:
            El usuario está preguntando específicamente sobre el proyecto: "${project}".
            Usa tu conocimiento base para enfocar la respuesta en este proyecto.
            `;
        }

        const fullPrompt = `
        ${memoryContent}

        ---
        ${contextInstruction}

        CONTEXTO DE LA SESIÓN:
        El usuario es un visitante del portfolio en una terminal interactiva.
        Responde de forma concisa, técnica pero amable. Estilo "Cyberpunk/Hacker".
        No uses Markdown complejo (negritas o encabezados), usa texto plano formateado para terminal.

        MENSAJE DEL USUARIO:
        "${prompt}"

        TU RESPUESTA (Stream):
        `;

        // 3. Generación en Stream
        const result = await model.generateContentStream(fullPrompt);

        // 4. Creamos un ReadableStream para enviar los trozos (chunks) al frontend
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(text); // Enviamos el fragmento de texto
                    }
                }
                controller.close();
            }
        });

        // Devolvemos la respuesta como stream de texto
        return new Response(stream, {
            headers: {
                'content-type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked' // Importante para streaming
            }
        });

    } catch (error) {
        console.error('[GEMINI API ERROR]', error);
        return new Response("Error de conexión con el núcleo cognitivo.", { status: 500 });
    }
};