import { LocalAgent, SorenMode } from './ollama-client';
import fs from 'fs';
import path from 'path';

const USERS_DIR = path.join(process.cwd(), 'data', 'users');

if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
}

export class IdentityManager {
    private localBrain: LocalAgent;

    constructor() {
        this.localBrain = new LocalAgent('dolphin-llama3');
    }

    public getExistingIdentities(): string[] {
        if (!fs.existsSync(USERS_DIR)) return [];
        return fs.readdirSync(USERS_DIR)
            .filter(f => f.endsWith('.md'))
            .map(f => f.replace('.md', ''));
    }

    public async generateIdentity(firstPrompt: string): Promise<string> {
        // Prompt más agresivo para que se calle la boca y solo dé el nombre
        const prompt = `
        TASK: Extract a 'hacker handle' (nickname) from the user's input style.
        USER INPUT: "${firstPrompt}"
        
        CRITICAL RULES:
        1. Output ONLY the nickname. NO sentences. NO "Here is the nickname".
        2. Format: kebab-case (e.g. quantum-ghost, code-breaker).
        3. Max length: 25 characters.
        `;

        try {
            const rawResponse = await this.localBrain.chat(SorenMode.ARCHITECT, prompt);
            
            // 1. Limpieza Inteligente:
            // Buscamos patrones de kebab-case explícitos en la respuesta
            // Esto ayuda si la IA dice "The nickname is: cyber-punk" -> extraemos "cyber-punk"
            const match = rawResponse.match(/\b[a-z0-9]+(?:-[a-z0-9]+){1,2}\b/i);
            
            let candidate = match ? match[0] : rawResponse;

            // 2. Limpieza final de caracteres basura
            candidate = candidate.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

            // 3. VALIDACIÓN DE SEGURIDAD (El bozal)
            // Si después de limpiar sigue siendo gigante (>30 chars) o vacío, usamos fallback.
            if (!candidate || candidate.length > 30) {
                console.warn(`⚠️ Nombre generado inválido ("${candidate.substring(0, 15)}..."). Usando fallback.`);
                return `user-${Date.now().toString().slice(-6)}`;
            }

            return candidate;

        } catch (error) {
            console.error("Error generando identidad:", error);
            return `anon-${Date.now().toString().slice(-6)}`;
        }
    }
}