import ollama from 'ollama';
import fs from 'fs';
import path from 'path';

export enum SorenMode {
  ARCHITECT = 'architect', // Black Hacker / Código
  WRITER = 'writer',       // Existencialista
  PUBLIC = 'public',       // Mr. Robot (Portfolio)
  RAW = 'raw'              // Sin personalidad
}

interface AgentConfig {
  model: string;
  temperature: number;
}

export class LocalAgent {
  private config: AgentConfig;

  constructor(modelName: string = 'dolphin-llama3', temperature: number = 0.7) {
    this.config = { model: modelName, temperature };
  }

  private loadPersona(mode: SorenMode): string {
    const basePath = path.join(process.cwd(), 'docs', 'vision');
    let filename = '';

    switch (mode) {
      case SorenMode.ARCHITECT: filename = 'architect_persona.md'; break;
      case SorenMode.WRITER:    filename = 'private_persona.md'; break;
      case SorenMode.PUBLIC:    filename = 'public_persona.md'; break;
      default: return "Eres una IA asistente útil.";
    }

    const fullPath = path.join(basePath, filename);
    try {
        return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : "Eres Søren.";
    } catch {
        return "Eres Søren.";
    }
  }

  async chat(mode: SorenMode, prompt: string, context: string = ""): Promise<string> {
    const persona = this.loadPersona(mode);
    const systemMsg = `${persona}\n\nCONTEXTO:\n${context}`;
    
    //console.log(`🧠 [Ollama] Pensando como ${mode}...`);
    
    try {
      const response = await ollama.chat({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt }
        ],
        stream: false,
        options: { temperature: this.config.temperature }
      });
      return response.message.content;
    } catch (error) {
      console.error("❌ Ollama Error:", error);
      return "Error: Cerebro local desconectado.";
    }
  }
}