import fs from 'fs';
import path from 'path';

const USERS_DIR = path.join(process.cwd(), 'data', 'users');

export class GlobalMemory {
    private userId: string;
    private filePath: string;

    constructor(userId: string) {
        this.userId = userId;
        this.filePath = path.join(USERS_DIR, `${userId}.md`);
        
        // Si no existe, lo crea con un encabezado
        if (!fs.existsSync(this.filePath)) {
            const header = `# Memoria Neural de: ${userId}\nCreado: ${new Date().toISOString()}\n\n`;
            fs.writeFileSync(this.filePath, header);
        }
    }

    /**
     * Escribe una interacción en el archivo del usuario específico.
     */
    public appendInteraction(role: 'USER' | 'SØREN', content: string): void {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `\n[${timestamp}] **${role}**: ${content}\n`;
        try {
            fs.appendFileSync(this.filePath, entry, 'utf-8');
        } catch (error) {
            console.error("❌ Error escribiendo memoria:", error);
        }
    }

    /**
     * Recupera el contexto de ESTE usuario.
     */
    public getRecentHistory(charLimit: number = 5000): string {
        if (!fs.existsSync(this.filePath)) return "";
        try {
            const content = fs.readFileSync(this.filePath, 'utf-8');
            return content.length > charLimit ? "..." + content.slice(-charLimit) : content;
        } catch (error) {
            return "";
        }
    }
}