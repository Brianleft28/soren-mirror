graph TD
    User((Usuario)) -->|Login / Prompt| CLI[interactive-soren.ts]
    
    subgraph "Nucleo de Identidad"
        CLI -->|Detecta| IM[IdentityManager]
        IM -->|Genera ID| UserID[kebab-case]
    end

    subgraph "Gestor de Proyectos"
        UserID -->|Instancia| PM[ProjectManager]
        PM -->|Lee/Escribe| FS[Sistema de Archivos]
    end

    subgraph "Sistema de Archivos (Data)"
        FS -->|Crea| Folder[data/users/kebab-case/projects/mi-novela/]
        Folder --> Draft[draft.md <br/>(La Novela)]
        Folder --> Memory[memory.md <br/>(Tus traumas/notas)]
        Folder --> Style[style.md <br/>(Estilo: Jazz/Crudo)]
        Folder --> Meta[metadata.json <br/>(Capítulos/Orden)]
    end

    subgraph "Cerebros IA"
        CLI -->|Contexto| Gemini[Gemini 1.5 <br/>(Lógica)]
        CLI -->|Estilo| Ollama[Dolphin Llama3 <br/>(Personalidad)]
        PM -.->|Inyecta Contexto| Gemini
    end

    classDef storage fill:#f9f,stroke:#333,stroke-width:2px;
    class Folder,Draft,Memory,Style,Meta storage;