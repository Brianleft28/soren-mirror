import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';

// --- CONFIGURACIÓN ---
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'dolphin-mistral';
const PROMPT_LIMIT = 5; // Límite de interacciones por IP

// Rutas base para lectura de archivos (Contexto)
const DOCS_BASE = path.join(process.cwd(), '..', 'docs');
const PROYECTOS_DIR = path.join(DOCS_BASE, 'proyectos');
const CONTEXT_DIR = path.join(DOCS_BASE, 'context');
const PERSONA_PATH = path.join(DOCS_BASE, 'vision', 'public_persona.md');

console.log(`[API CHAT] Usando modelo Ollama: ${OLLAMA_MODEL} en ${OLLAMA_URL}`);
console.log(`[API CHAT] Límite de prompts por IP: ${PROMPT_LIMIT}`);
console.log(`[API CHAT] Cargando personalidad desde: ${PERSONA_PATH}`);
console.log(`[API CHAT] Cargando proyectos desde: ${PROYECTOS_DIR}`);
console.log(`[API CHAT] Cargando contexto desde: ${CONTEXT_DIR}`);

// Memoria volátil de interacciones (IP -> contador)
const interactions: Record<string, number> = {};

/**
 * GET: Lista los proyectos disponibles para el menú del Frontend
 */
export const GET: RequestHandler = async () => {
    try {
        if (!fs.existsSync(PROYECTOS_DIR)) {
            return json({ proyectos: [] });
        }

        const proyectos = fs
            .readdirSync(PROYECTOS_DIR, { withFileTypes: true })
            .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.md'))
            .map((dirent) => dirent.name.replace('.md', ''));

        return json({ proyectos });
    } catch (error) {
        console.error('[API GET PROYECTOS ERROR]', error);
        return json({ error: 'Error listando proyectos' }, { status: 500 });
    }
};
/**
 * POST: Procesa el chat usando OLLAMA con rate limiting.
 */
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    try {
        // Rate Limiting por IP
        const clientIp = getClientAddress();
        const promptCount = interactions[clientIp] || 0;

        if (promptCount >= PROMPT_LIMIT) {
            return json(
                { error: `Límite de ${PROMPT_LIMIT} prompts alcanzado. Gracias por probar el asistente.` },
                { status: 429 } // 429 Too Many Requests
            );
        }

        const { prompt, project } = await request.json();
        
        if (!prompt) {
            return json({ error: 'El prompt es requerido' }, { status: 400 });
        }

        // Cargar Personalidad y Contexto
        let systemPrompt = fs.existsSync(PERSONA_PATH) ? fs.readFileSync(PERSONA_PATH, 'utf-8') : '';

        // Cargar contexto del perfil personal
        const profilePath = path.join(CONTEXT_DIR, 'personal_profile.md');
        if (fs.existsSync(profilePath)) {
            systemPrompt += `\n\n--- CONTEXTO SOBRE EL AUTOR ---\n${fs.readFileSync(profilePath, 'utf-8')}`;
        }

        // Cargar contexto del proyecto si se especificó
         if (project) {
            const projectDocPath = path.join(PROYECTOS_DIR, `${project}.md`);
            if (fs.existsSync(projectDocPath)) {

                systemPrompt += `\n\n--- CONTEXTO DEL PROYECTO: ${project} ---\n${fs.readFileSync(projectDocPath, 'utf-8')}`;
            }
        }

        // --- DEBUG: ESTO TE MOSTRARÁ LO QUE "VE" OLLAMA ---
        console.log("----------------------------------------------------");
        console.log("🛠️ PROMPT REAL ENVIADO A OLLAMA:");
        console.log("SYSTEM PROMPT (PRIMEROS 500 chars):", systemPrompt.substring(0, 500) + "...");
        console.log("USER PROMPT:", prompt);
        console.log("----------------------------------------------------");
        // ----------

         // Llamada a Ollama
        const ollamaResponse = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                system: systemPrompt,
                stream: true // Correcto, mantenemos el streaming
            })
        });

        if (!ollamaResponse.ok) {
            const errorBody = await ollamaResponse.json();
            throw new Error(errorBody.error || `Error en la comunicación con Ollama: ${ollamaResponse.statusText}`);
        }
         // No usamos response.json(). En su lugar, tomamos el cuerpo del stream
        // y lo devolvemos directamente al cliente. SvelteKit se encarga del resto.
        if (!ollamaResponse.body) {
            throw new Error("La respuesta de Ollama no tenía cuerpo (body).");
        }

        interactions[clientIp] = promptCount + 1;
        console.log(`[INFO] Prompt de ${clientIp} (count: ${interactions[clientIp]}). Iniciando stream...`);

        // Devolvemos un objeto Response que contiene el stream de Ollama.
        return new Response(ollamaResponse.body, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        });
        // --- FIN DE LA CORRECCIÓN ---

    } catch (error: any) {
        console.error('[API CHAT ERROR]', error);
        return json({ error: 'Error procesando la solicitud' }, { status: 500 });
    }
};