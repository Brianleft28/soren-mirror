// src/modules/archivist.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';

// Definimos dónde viven tus historias (volumen de Docker)
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
    status: 'RAW' | 'DRAFT' | 'POLISHED';
}

export class Archivist {
    
    /**
     * Guarda una nueva entrada o actualiza una existente.
     * Si no tiene título, le inventa uno basado en la fecha.
     */

    static saveEntry(content: string, metadata?: Partial<StoryMetadata>): string {
        const id = metadata?.id || uuidv4();
        const date = new Date().toISOString();
        
        const finalMetadata: StoryMetadata = {
            id,
            title: metadata?.title || `Sesión ${date.split('T')[0]}`,
            date,
            tags: metadata?.tags || ['general'],
            status: metadata?.status || 'RAW'
        };

        // Creamos el contenido con Frontmatter (YAML)
        const fileContent = matter.stringify(content, finalMetadata);
        
        // Guardamos el archivo: "2025-12-08-Sesion.md"
        const filename = `${date.split('T')[0]}-${finalMetadata.title.replace(/\s+/g, '_')}.md`;
        fs.writeFileSync(path.join(STORAGE_PATH, filename), fileContent);

        return id;
    }

    /**
     * Recupera el contexto reciente para dárselo a Søren.
     * Por ahora, lee los últimos 3 archivos modificados.
     */

    static getRecentContext(): string {
        const files = fs.readdirSync(STORAGE_PATH)
            .filter(f => f.endsWith('.md'))
            .map(f => ({
                name: f,
                time: fs.statSync(path.join(STORAGE_PATH, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time) // Más recientes primero
            .slice(0, 3); // Solo los últimos 3

        let contextAccumulator = "";

        files.forEach(file => {
            const raw = fs.readFileSync(path.join(STORAGE_PATH, file.name), 'utf-8');
            const parsed = matter(raw);
            contextAccumulator += `\n---\n[ARCHIVO: ${parsed.data.title} (${parsed.data.status})]\n${parsed.content.substring(0, 500)}...\n`;
        });

        return contextAccumulator;
    }
}