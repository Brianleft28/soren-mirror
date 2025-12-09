import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_PATH = path.join(process.cwd(), 'data', 'stories');

// Aseguramos que la carpeta exista
if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

export interface StoryMetadata {
    id: string;
    title: string;
    date: string;
    tags: string[];
    wordCount: number;
}

export class Archivist {
    /**
     * Guarda una sesión de chat como un archivo Markdown.
     */
    static saveSession(chatHistory: { user: string, soren: string }[]): string {
        const id = uuidv4();
        const date = new Date().toISOString();
        const title = `Sesión de Escritura - ${date.split('T')[0]}`;

        let content = `# ${title}\n\n`;
        let wordCount = 0;

        for (const turn of chatHistory) {
            content += `**[VOS]**\n${turn.user}\n\n`;
            content += `**[SØREN]**\n${turn.soren}\n\n---\n\n`;
            wordCount += turn.user.split(/\s+/).length;
        }

        const metadata: StoryMetadata = {
            id,
            title,
            date,
            tags: ['sesion-escritura', 'raw'],
            wordCount
        };

        // Usamos un formato simple sin frontmatter por ahora
        const filename = `${date.split('T')[0]}-${id.substring(0, 8)}.md`;
        const fullPath = path.join(STORAGE_PATH, filename);
        
        fs.writeFileSync(fullPath, `<!--\n${JSON.stringify(metadata, null, 2)}\n-->\n\n${content}`);

        console.log(`\n💾 Sesión guardada en: ${fullPath}`);
        return id;
    }
}