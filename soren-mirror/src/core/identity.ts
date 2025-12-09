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
        const prompt = `
        TASK: Extract a hacker nickname from: "${firstPrompt}".
        RULES: Max 15 chars. Kebab-case. NO explanations. Just the name.
        `;

        try {
            const rawResponse = await this.localBrain.chat(SorenMode.ARCHITECT, prompt);
            
            // Limpieza agresiva: solo letras, números y guiones
            let candidate = rawResponse.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
            
            // Si quedó vacío o es muy largo, usamos timestamp
            if (!candidate || candidate.length > 20 || candidate.length < 3) {
                return `user-${Date.now().toString().slice(-4)}`; // Ejemplo: user-9821
            }
            return candidate;

        } catch (error) {
            return `user-${Date.now().toString().slice(-4)}`;
        }
    }
}