import fs from 'fs';
import path from 'path';
import chalk from 'chalk'; // Importamos chalk que faltaba

export enum SorenMode {
  ARCHITECT = 'architect',
  WRITER = 'writer',
  PUBLIC = 'public',
  RAW = 'raw'
}

const SOREN_CORE_API_URL = 'http://soren-core:3000';


export class LocalAgent {
  private model: string;
  private temperature: number;
  private ollamaUrl: string;

  constructor(model: string = 'dolphin-llama3', baseUrl: string = 'http://localhost:11434') {
    this.model = model;
    this.temperature = 0.5; // Definimos una temperatura por defecto
    this.ollamaUrl = `${baseUrl}/api/generate`; // Usamos el endpoint /api/generate
    console.log(chalk.blue(`🤖 Agente Local conectado a: ${baseUrl}`));
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
 async  chat(mode: SorenMode, prompt: string, context: string = ""): Promise<string> {
    const persona = this.loadPersona(mode);
    const systemPrompt = `${persona}\n\nCONTEXTO PREVIO:\n${context}`;
    
    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          system: systemPrompt,
          prompt: prompt,
          stream: true, // Correcto, usamos stream
          options: {
            temperature: this.temperature
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error en la comunicación con Ollama (${response.status}): ${errorBody}`);
      }

      if (!response.body) {
        throw new Error("La respuesta del servidor no tiene cuerpo (body).");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunkText = decoder.decode(value);
        const lines = chunkText.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const chunkJson = JSON.parse(line);
            if (chunkJson.response) {
              fullResponse += chunkJson.response;
            }
          } catch (e) {
            const token_perdido = line.length > 50 ? line.slice(0, 50) + '...' : line;
            console.error(chalk.red("❌ Error al parsear el chunk de Ollama:"), token_perdido, e);
          }
        }
      }
      
      return fullResponse;

    } catch (error) {
      console.error(chalk.red("❌ Ollama Error:"), error);
      return "Error: Cerebro local desconectado. Verifica que Ollama esté corriendo y sea accesible en la URL configurada.";
    }
  }
}