// src/routes/api/chat/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';

// Simulamos base de datos en memoria
const interacciones: Record<string, number> = {};

export const POST: RequestHandler = async ({ request }) => {
    try {
        // En SvelteKit obtenemos el JSON así:
        const { mensajeUsuario, usuarioId } = await request.json();

        // 1. CONTROL DE ACCESO
        const count = interacciones[usuarioId] || 0;
        if (count >= 7) {
            return json({ 
                respuesta: "¡Epa, máquina! Ya hemos hablado mucho. He llegado a mi límite de 7 respuestas por hoy. ¡Gracias por pasarte!" 
            });
        }

        // 2. LEER LA BIBLIOTECA
        // process.cwd() en SvelteKit te suele dejar en la raíz del proyecto
        const docsPath = path.join(process.cwd(), 'docs');
        
        // Leemos la personalidad
        const persona = fs.readFileSync(path.join(docsPath, 'public_persona.md'), 'utf-8');
        
        // Leemos TUS PROYECTOS
        const proyectosDir = path.join(docsPath, 'proyectos');
        
        // Verificamos si existe la carpeta para evitar errores si está vacía o nueva
        let contextoTecnico = "";
        if (fs.existsSync(proyectosDir)) {
             const archivosProyectos = fs.readdirSync(proyectosDir);
             archivosProyectos.forEach(archivo => {
                const contenido = fs.readFileSync(path.join(proyectosDir, archivo), 'utf-8');
                contextoTecnico += `\n--- PROYECTO: ${archivo} ---\n${contenido}`;
            });
        }

        // 3. ARMAR EL PROMPT
        const promptDelSistema = persona.replace('{{CONTEXTO_TECNICO}}', contextoTecnico);

        // Simulamos respuesta (Aca iría la llamada a la API de Gemini )
        const respuestaSimulada = `(Simulación SvelteKit) He leído tus docs. Contexto cargado: ${contextoTecnico.length} caracteres.`;

        // 4. ACTUALIZAR CONTADOR
        interacciones[usuarioId] = count + 1;

        return json({ respuesta: respuestaSimulada });

    } catch (error) {
        console.error(error);
        return json({ error: 'Explotó el servidor SvelteKit, fiera.' }, { status: 500 });
    }
};