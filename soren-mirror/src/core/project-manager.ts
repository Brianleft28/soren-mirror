import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'users');

export class ProjectManager {
    private userId: string;
    private userProjectsDir: string;

    constructor(userId: string) {
        this.userId = userId;
        this.userProjectsDir = path.join(DATA_DIR, userId, 'projects');
        
        // Aseguramos que exista la carpeta de proyectos DEL USUARIO
        if (!fs.existsSync(this.userProjectsDir)) {
            fs.mkdirSync(this.userProjectsDir, { recursive: true });
        }
    }

    // Lista solo los proyectos de ESTE usuario
    public getProjects(): string[] {
        return fs.readdirSync(this.userProjectsDir).filter(file => 
            fs.statSync(path.join(this.userProjectsDir, file)).isDirectory()
        );
    }

    // Crea proyecto con archivo de ESTILO/FORMATO
    public createProject(projectName: string, context: string = "", styleGuide: string = "") {
        const dir = path.join(this.userProjectsDir, projectName);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        // 1. El Borrador (Draft)
        fs.writeFileSync(path.join(dir, 'draft.md'), `# ${projectName}\n\n(Escribe aquí...)`);
        
        // 2. La Memoria/Contexto (Ideas sueltas)
        fs.writeFileSync(path.join(dir, 'memory.md'), context || "Notas del proyecto.");

        // 3. EL FORMATO (Lo que pediste: El estilo que quieres lograr)
        const defaultStyle = "Estilo: Existencialista, crudo, ritmo de jazz, oraciones cortas.";
        fs.writeFileSync(path.join(dir, 'style_guide.md'), styleGuide || defaultStyle);
    }

    public loadProjectContext(projectName: string): string {
        const dir = path.join(this.userProjectsDir, projectName);
        
        const draft = this.readFileSafe(path.join(dir, 'draft.md'));
        const memory = this.readFileSafe(path.join(dir, 'memory.md'));
        const style = this.readFileSafe(path.join(dir, 'style_guide.md'));

        return `
        === PROYECTO: ${projectName} ===
        
        [GUÍA DE ESTILO / FORMATO DESEADO]:
        ${style}

        [MEMORIA Y NOTAS]:
        ${memory}

        [BORRADOR ACTUAL]:
        ${draft.slice(-5000)}
        `;
    }

    public appendToProjectMemory(projectName: string, content: string) {
        const file = path.join(this.userProjectsDir, projectName, 'memory.md');
        const entry = `\n[${new Date().toLocaleString()}] ${content}\n`;
        fs.appendFileSync(file, entry);
    }

    private readFileSafe(path: string): string {
        return fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : "";
    }
}