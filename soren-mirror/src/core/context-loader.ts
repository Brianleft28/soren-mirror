// src/core/context-loader.ts
import fs from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DualMemory {
  principal: string;
  draft: string;
  lastUpdated: Date;
  horizonDetected: boolean;
  horizonAnalysis: string; // Análisis de Gemini
}

export interface LoadedContexts {
  personalProfile: string;
  memory: DualMemory;
  projectContexts: Map<string, string>;
}

export class ContextLoader {
  private username: string;
  private userDataDir: string;
  private memoryDir: string;
  private gemini: GoogleGenerativeAI;

  constructor(username: string) {
    this.username = username;
    this.userDataDir = path.join(process.cwd(), "data", "users", username);
    this.memoryDir = path.join(this.userDataDir, "memory");

    const apiKey = process.env.GEMINI_API_KEY || "";
    this.gemini = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Cargar TODO el contexto del usuario al loginear
   */
  async loadAll(): Promise<LoadedContexts> {
    await fs.mkdir(this.memoryDir, { recursive: true });

    const personalProfile = await this.loadPersonalProfile();
    const memory = await this.loadDualMemory();
    const projectContexts = await this.loadProjectContexts();

    return {
      personalProfile,
      memory,
      projectContexts,
    };
  }

  /**
   * Cargar perfil personal
   */
  private async loadPersonalProfile(): Promise<string> {
    const profilePath = path.join(this.userDataDir, "personal_profile.md");

    try {
      return await fs.readFile(profilePath, "utf-8");
    } catch {
      const defaultProfile = `# Perfil Personal - ${this.username}

## Información General
- **Usuario:** ${this.username}
- **Creado:** ${new Date().toISOString()}

## Contexto
Pendiente de completar.

## Notas 
Pendiente.
`;
      await fs.writeFile(profilePath, defaultProfile);
      return defaultProfile;
    }
  }

  /**
   * Cargar memoria DUAL con análisis SEMÁNTICO via Gemini
   * ADR-008: Monitor de Horizonte Semántico
   */
  private async loadDualMemory(): Promise<DualMemory> {
    const principalPath = path.join(this.memoryDir, "memory.md");
    const draftPath = path.join(this.memoryDir, "draft.md");

    let principal = "";
    let draft = "";

    try {
      principal = await fs.readFile(principalPath, "utf-8");
    } catch {
      principal = this.getDefaultMemory("principal");
      await fs.writeFile(principalPath, principal);
    }

    try {
      draft = await fs.readFile(draftPath, "utf-8");
    } catch {
      draft = this.getDefaultMemory("draft");
      await fs.writeFile(draftPath, draft);
    }

    // Análisis SEMÁNTICO con Gemini (ADR-008)
    const { horizonDetected, analysis } = await this.analyzeHorizonLoss(
      principal,
      draft
    );

    return {
      principal,
      draft,
      lastUpdated: new Date(),
      horizonDetected,
      horizonAnalysis: analysis,
    };
  }

  /**
   * ANÁLISIS SEMÁNTICO CON GEMINI (ADR-008)
   * Comparar draft vs principal para detectar pérdida de horizonte
   */
  private async analyzeHorizonLoss(
    principal: string,
    draft: string
  ): Promise<{ horizonDetected: boolean; analysis: string }> {
    const apiKey = process.env.GEMINI_API_KEY;
     // Si no hay API Key, usar análisis simple
  if (!apiKey) {
    const draftLines = draft.split("\n").length;
    const principalLines = principal.split("\n").length;
    const ratio = draftLines / Math.max(principalLines, 1);
    
    return {
      horizonDetected: ratio > 5,
      analysis: `⚠️ Sin API Key. Análisis simple: Draft tiene ${draftLines} líneas vs ${principalLines} en principal (ratio: ${ratio.toFixed(1)}x)`,
    };
  }

    const model = this.gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    
    const prompt = `Eres un analizador de patrones cognitivos especializado en detectar "pérdida de horizonte" (hiperfoco en detalles sin consolidación de ideas).

TAREA:
Analiza estas DOS memorias y responde si hay PÉRDIDA DE HORIZONTE:

---MEMORIA PRINCIPAL (Consolidada):---
${principal}

---DRAFT (Notas en tiempo real):---
${draft}

---CRITERIOS DE DETECCIÓN (ADR-008):---
✓ HORIZONTE PERDIDO si:
  1. El draft tiene muchos detalles micro (tareas, bugs, pequeñas notas) 
  2. La memoria principal NO refleja estructuras arquitectónicas claras
  3. Hay dispersión temática sin unidad conceptual
  4. Falta visión de "por qué" (solo "qué" y "cómo")

✗ HORIZONTE OK si:
  1. Los detalles en draft se conectan a objetivos mayores
  2. Hay consolidación clara en memoria principal
  3. Existe visión arquitectónica clara

---RESPUESTA (JSON):---
Responde SOLO con JSON válido en este formato:
{
  "horizonDetected": boolean,
  "confidence": number (0-1),
  "analysis": "string con análisis breve",
  "recommendations": "string con recomendaciones"
}
`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extraer JSON de la respuesta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          horizonDetected: parsed.horizonDetected,
          analysis: `[Confidence: ${(parsed.confidence * 100).toFixed(0)}%] ${
            parsed.analysis
          }\n\n💡 ${parsed.recommendations}`,
        };
      }

      // Fallback si no se parsea bien
      return {
        horizonDetected: false,
        analysis: "No se pudo analizar - usando análisis fallback",
      };
    } catch (error) {
      console.error("Error en análisis Gemini:", error);
      return {
        horizonDetected: false,
        analysis: "❌ Error al analizar con Gemini (API Key faltante?)",
      };
    }
  }

  /**
   * Cargar contextos de proyectos activos
   */
  private async loadProjectContexts(): Promise<Map<string, string>> {
    const projects = new Map<string, string>();
    const projectsDir = path.join(this.userDataDir, "projects");

    try {
      const projectFolders = await fs.readdir(projectsDir, {
        withFileTypes: true,
      });

      for (const folder of projectFolders) {
        if (folder.isDirectory()) {
          const manifestPath = path.join(
            projectsDir,
            folder.name,
            "manifest.md"
          );
          try {
            const content = await fs.readFile(manifestPath, "utf-8");
            projects.set(folder.name, content);
          } catch {
            // Ignorar
          }
        }
      }
    } catch {
      // Sin proyectos
    }

    return projects;
  }

  /**
   * Actualizar memoria principal
   */
  async updatePrincipalMemory(content: string): Promise<void> {
    const principalPath = path.join(this.memoryDir, "memory.md");
    await fs.writeFile(principalPath, content);
  }

  /**
   * Actualizar draft
   */
  async updateDraft(content: string): Promise<void> {
    const draftPath = path.join(this.memoryDir, "draft.md");
    await fs.writeFile(draftPath, content);
  }

  /**
   * Obtener resumen para logs
   */
  getLoadSummary(contexts: LoadedContexts): string {
    const projectCount = contexts.projectContexts.size;
    const principalSize = contexts.memory.principal.length;
    const draftSize = contexts.memory.draft.length;

    let horizonStatus = "✅ HORIZONTE OK";
    if (contexts.memory.horizonDetected) {
      horizonStatus = "⚠️ HORIZONTE PERDIDO - Modo modular recomendado";
    }

    return `
📚 CONTEXTOS CARGADOS:
  • Perfil Personal: ${contexts.personalProfile.length} bytes
  • Memoria Principal: ${principalSize} bytes
  • Draft (Notas): ${draftSize} bytes
  • Proyectos Activos: ${projectCount}
  
${horizonStatus}
${
  contexts.memory.horizonAnalysis
    ? `\n📊 Análisis:\n${contexts.memory.horizonAnalysis}`
    : ""
}
    `;
  }

  private getDefaultMemory(type: "principal" | "draft"): string {
    if (type === "principal") {
      return `# Memoria Principal - ${this.username}
## Estado General
- Creada: ${new Date().toISOString()}
- Última actualización: ${new Date().toISOString()}

## Resumen de Temas
Pendiente de consolidación.

## Archivos Vinculados
- personal_profile.md
- draft.md
`;
    } else {
      return `# Draft - Notas en Tiempo Real

## Sesión: ${new Date().toISOString()}

### Tareas Pendientes
- [ ] Consolidar cambios en memoria principal

### Notas Rápidas
- Estado inicial

---
**Nota:** Este archivo se actualiza en tiempo real. Las entradas finales se consolidan en memory.md
`;
    }
  }
}
