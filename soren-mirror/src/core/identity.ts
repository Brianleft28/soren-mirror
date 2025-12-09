import { LocalAgent, SorenMode } from './ollama-client';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const USERS_DIR = path.join(process.cwd(), 'data', 'users');

// Aseguramos que exista la carpeta de usuarios
if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
}

export class IdentityManager {
    private localBrain: LocalAgent;

    constructor() {
        this.localBrain = new LocalAgent('dolphin-llama3'); // Usamos Dolphin para ser creativos
    }

    /**
     * Lista los usuarios existentes (archivos .md en data/users)
     */
    public getExistingIdentities(): string[] {
        if (!fs.existsSync(USERS_DIR)) return [];
        return fs.readdirSync(USERS_DIR)
            .filter(f => f.endsWith('.md'))
            .map(f => f.replace('.md', ''));
    }

    /**
     * Genera un apodo hacker basado en el primer prompt del usuario.
     */
    public async generateIdentity(firstPrompt: string): Promise<string> {
        console.log(chalk.yellow("\n🔍 Analizando patrón de escritura para asignar identidad..."));

        const prompt = `
        TAREA: Genera un "Hacker Nickname" de máximo 3 palabras para un usuario basado en este texto que escribió.
        
        TEXTO DEL USUARIO: "${firstPrompt}"
        
        REGLAS:
        1. Formato: palabra1-palabra2-palabra3 (kebab-case).
        2. Solo letras minúsculas y guiones.
        3. Debe sonar misterioso, técnico o cyberpunk.
        4. NO expliques nada. Solo devuelve el string del nombre.
        `;

        // Usamos el modo RAW o ARCHITECT para esto
        const nickname = await this.localBrain.chat(SorenMode.ARCHITECT, prompt);
        
        // Limpiamos por si la IA se pone charlatana (regex para dejar solo letras y guiones)
        const cleanName = nickname.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        
        return cleanName || `user-${Date.now()}`; // Fallback por si falla
    }
}