import fs from 'fs';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), 'data', 'projects');

if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

export class ProjectManager {
    
    // Lista las carpetas en data/projects
    static getProjects(): string[] {
        return fs.readdirSync(PROJECTS_DIR).filter(file => 
            fs.statSync(path.join(PROJECTS_DIR, file)).isDirectory()
        );
    }

    // Crea un nuevo entorno de trabajo
    static createProject(projectName: string, initialContext: string = "") {
        const dir = path.join(PROJECTS_DIR, projectName);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        // Archivo del manuscrito
        fs.writeFileSync(path.join(dir, 'draft.md'), `# ${projectName}\n\n(Comienza a escribir aquí...)`);
        
        // Archivo de contexto (memorias, ideas, fragmentos como el que subiste)
        fs.writeFileSync(path.join(dir, 'memory.md'), initialContext || "Notas y contexto existencial del proyecto.");
    }

    // Lee todo el contenido del proyecto para dárselo a la IA
    static loadProjectContext(projectName: string): string {
        const dir = path.join(PROJECTS_DIR, projectName);
        
        const draft = fs.existsSync(path.join(dir, 'draft.md')) 
            ? fs.readFileSync(path.join(dir, 'draft.md'), 'utf-8') 
            : "";
            
        const memory = fs.existsSync(path.join(dir, 'memory.md')) 
            ? fs.readFileSync(path.join(dir, 'memory.md'), 'utf-8') 
            : "";

        return `
        === PROYECTO ACTUAL: ${projectName.toUpperCase()} ===
        
        [MEMORIA / CONTEXTO / NOTAS]:
        ${memory}

        [BORRADOR ACTUAL]:
        ${draft.slice(-5000)} 
        ( Últimos 5000 caracteres del borrador para mantener contexto )
        `;
    }

    // Guarda lo que generes o discutas en el archivo de memoria del proyecto
    static appendToProjectMemory(projectName: string, content: string) {
        const file = path.join(PROJECTS_DIR, projectName, 'memory.md');
        const entry = `\n[${new Date().toLocaleString()}] ${content}\n`;
        fs.appendFileSync(file, entry);
    }
}