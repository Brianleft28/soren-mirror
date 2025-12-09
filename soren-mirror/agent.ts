import * as fs from 'fs';
import * as path from 'path';
import { IProject } from '../interfaces/agent.js';

export class ProjectManager {
    private userBasePath: string; // Ruta base del usuario: data/users/{username}
    private projectsPath: string;
    private memoryPath: string;
    private draftsPath: string;
    private currentUser: string;

    constructor(username: string) {
        this.currentUser = username;
        
        // 1. RUTA BASE DEL USUARIO
        this.userBasePath = path.join('data', 'users', username);

        // 2. RUTAS ESPECIALIZADAS POR TIPO DE DATO
        this.projectsPath = path.join(this.userBasePath, 'projects');
        this.memoryPath = path.join(this.userBasePath, 'memory');
        this.draftsPath = path.join(this.userBasePath, 'drafts');

        // 3. CREAR TODA LA ESTRUCTURA SI NO EXISTE
        fs.mkdirSync(this.projectsPath, { recursive: true });
        fs.mkdirSync(this.memoryPath, { recursive: true });
        fs.mkdirSync(this.draftsPath, { recursive: true });
    }

    /**
     * Crea los archivos de un nuevo proyecto en sus respectivas carpetas.
     */
    public createProject(name: string, style: string, manifesto: string): void {
        const projectFilePath = path.join(this.projectsPath, `${name}.md`);
        if (fs.existsSync(projectFilePath)) {
            console.warn(`⚠️  El proyecto '${name}' ya existe. No se ha modificado.`);
            return;
        }

        // Escribimos cada archivo en su lugar correspondiente
        fs.writeFileSync(projectFilePath, manifesto);
        fs.writeFileSync(path.join(this.memoryPath, `${name}.md`), `# Memoria de ${name}\n\n`);
        fs.writeFileSync(path.join(this.draftsPath, `${name}.md`), `# Voceto de ${name}\n\n`);
        
        console.log(`✅ Proyecto '${name}' creado con su estructura de archivos distribuida.`);
    }

    /**
     * Carga un proyecto completo desde sus distintos archivos.
     */
    public loadProject(projectName: string): IProject | null {
        const projectFilePath = path.join(this.projectsPath, `${projectName}.md`);
        if (!fs.existsSync(projectFilePath)) {
            return null;
        }

        try {
            const manifest = fs.readFileSync(projectFilePath, 'utf-8');
            const memory = fs.readFileSync(path.join(this.memoryPath, `${projectName}.md`), 'utf-8');
            const outline = fs.readFileSync(path.join(this.draftsPath, `${projectName}.md`), 'utf-8');
            const style = "Desconocido"; // Esto se puede sacar del manifiesto o un metadata.json

            return { name: projectName, style, manifest, memory, outline };
        } catch (error) {
            console.error(`❌ Error al cargar el proyecto '${projectName}':`, error);
            return null;
        }
    }

    /**
     * Añade contenido al archivo de memoria de un proyecto específico.
     */
    public appendToMemory(projectName: string, content: string): void {
        const filePath = path.join(this.memoryPath, `${projectName}.md`);
        fs.appendFileSync(filePath, `\n\n${content}`);
    }

    /**
     * Añade contenido al archivo de voceto de un proyecto específico.
     */
    public appendToOutline(projectName: string, content: string): void {
        const filePath = path.join(this.draftsPath, `${projectName}.md`);
        fs.appendFileSync(filePath, `\n\n${content}`);
    }

    /**
     * Obtiene una lista de los nombres de todos los proyectos (archivos .md en la carpeta projects).
     */
    public getProjects(): string[] {
        if (!fs.existsSync(this.projectsPath)) return [];
        
        return fs.readdirSync(this.projectsPath)
            .filter((file: string) => file.endsWith('.md'))
            .map((file: string) => file.replace('.md', ''));
    }
}