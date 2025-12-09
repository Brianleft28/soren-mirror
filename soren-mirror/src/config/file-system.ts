export type FileNode = {
    name: string;
    type: 'folder' | 'file';
    children?: FileNode[];
    content?: string; // El contexto técnico
};

export const fileSystem: FileNode = {
    name: 'root',
    type: 'folder',
    children: [
        {
            name: '📂 General',
            type: 'folder',
            children: [
                {
                    name: '📄 Contexto Libre (Perfil General)',
                    type: 'file',
                    content: 'Søren actúa con su conocimiento base sobre Brian. No hay proyecto específico cargado, se usan todos sus proyectos y experiencia general para no perder contexto.'
                }
            ]
        },
        {
            name: '📂 Proyectos',
            type: 'folder',
            children: [
                {
                    name: '📄 Søren Mirror (Este CLI)',
                    type: 'file',
                    content: 'CONTEXTO TÉCNICO: Søren Mirror es un agente CLI en Node.js. Usa Inquirer para la UI, Gemini/Ollama para la inferencia y Docker para la ejecución. Arquitectura: src/core (IA), src/modules (Capacidades).'
                },
                {
                    name: '📄 Portfolio SvelteKit',
                    type: 'file',
                    content: 'CONTEXTO TÉCNICO: Portfolio personal desarrollado en SvelteKit con TailwindCSS. Implementa arquitectura "Docs as Code" donde el sistema de archivos alimenta la UI y el chat.'
                }
            ]
        }
    ]
};