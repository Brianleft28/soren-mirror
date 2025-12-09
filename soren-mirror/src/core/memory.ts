import fs from 'fs';
import path from 'path';

const USERS_DIR = path.join(process.cwd(), 'data', 'users');

export class GlobalMemory {
    private userId: string;
    private filePath: string;
    private userBasePath: string;

    constructor(userId: string) {
        this.userId = userId;
        this.userBasePath = path.join(USERS_DIR, this.userId);
        this.filePath = path.join(this.userBasePath, 'global_memory.md'); // <-- RUTA CORREGIDA
        
        // Aseguramos que el directorio del usuario exista
        fs.mkdirSync(this.userBasePath, { recursive: true });

        // Si no existe el archivo de memoria global, lo crea con un encabezado
        if (!fs.existsSync(this.filePath)) {
            const header = `# Memoria Global de: ${userId}\nCreado: ${new Date().toISOString()}\n\n`;
            fs.writeFileSync(this.filePath, header);
        }
    }

    /**
     * Escribe una interacción en el archivo de memoria global del usuario.
     */
    public appendInteraction(role: 'USER' | 'SØREN', content: string): void {
        const timestamp = new Date().toLocaleTimeString('es-AR');
        const entry = `\n[${timestamp}] **${role}**: ${content}\n`;
        try {
            fs.appendFileSync(this.filePath, entry, 'utf-8');
        } catch (error) {
            console.error("❌ Error escribiendo en memoria global:", error);
        }
    }

    /**
     * Recupera el historial reciente de la memoria global de ESTE usuario.
     */
    public getRecentHistory(charLimit: number = 5000): string {
        if (!fs.existsSync(this.filePath)) return "";
        try {
            const content = fs.readFileSync(this.filePath, 'utf-8');
            return content.length > charLimit ? "..." + content.slice(-charLimit) : content;
        } catch (error) {
            console.error(`❌ Error leyendo la memoria global para ${this.userId}:`, error);
            return "";
        }
    }
}