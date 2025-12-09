import fs from 'fs';
import path from 'path';

const MEMORY_FILE = path.join(process.cwd(), 'data', 'global_context.md');

// Aseguramos que exista el archivo
if (!fs.existsSync(path.dirname(MEMORY_FILE))) {
    fs.mkdirSync(path.dirname(MEMORY_FILE), { recursive: true });
}

export class GlobalMemory {
    /**
     * Registra cada interacción en el "Cerebro Global".
     * Esto es lo que leerá la IA para entender tu evolución.
     */
    static appendInteraction(role: 'USER' | 'SØREN' | 'SYSTEM', content: string) {
        const timestamp = new Date().toISOString();
        const entry = `\n[${timestamp}] **${role}**: ${content}\n`;
        
        fs.appendFileSync(MEMORY_FILE, entry);
    }

    /**
     * Obtiene el contexto reciente (Rolling Window).
     * No podemos pasarle 1GB de texto, así que tomamos los últimos X caracteres.
     */
    static getRecentHistory(chars: number = 8000): string {
        if (!fs.existsSync(MEMORY_FILE)) return "";
        
        const fullContent = fs.readFileSync(MEMORY_FILE, 'utf-8');
        // Si es muy largo, cortamos el final; si es corto, lo devolvemos todo.
        return fullContent.length > chars ? "..." + fullContent.slice(-chars) : fullContent;
    }
}