import { SorenCommand } from "../dispatcher/soren-command.js";
import { IChannel } from "../channels/IChanel.js";
import { SessionManager } from "../core/sesion-manager.js";
import { ContextLoader } from "../core/context-loader.js";
import { generateText } from "../core/gemini-client.js";
import fs from "fs/promises";
import path from "path";

export class ConsolidateCommand extends SorenCommand {
  name = "consolidate";
  description = "Procesa el Draft y actualiza la Memoria Principal y el Perfil.";
  parameters = [];

  private sessionManager: SessionManager;

  constructor(sessionManager: SessionManager) {
    super();
    this.sessionManager = sessionManager;
  }

  async execute(args: string[], channel: IChannel): Promise<void> {
    await channel.send("🧠 Iniciando proceso de consolidación cognitiva...");
    
    const currentUser = this.sessionManager.getCurrentUser();
    if (!currentUser) return;

    const contextLoader = new ContextLoader(currentUser);
    const contexts = await contextLoader.loadAll();
    const draftContent = contexts.memory.draft;

    if (draftContent.length < 50) {
      await channel.send("⚠️ El Draft es demasiado corto para consolidar.");
      return;
    }

    const prompt = `
    ACTÚA COMO: Archivista Cognitivo de Søren.
    
    TAREA:
    Analiza las siguientes NOTAS DEL DRAFT (Borrador) y extrae información para actualizar los archivos permanentes.
    
    INPUT (DRAFT):
    ${draftContent}

    CONTEXTO ACTUAL (Perfil):
    ${contexts.personalProfile}

    SALIDA ESPERADA (JSON):
    {
      "profile_updates": ["Dato 1", "Dato 2"], (Datos nuevos sobre el usuario: gustos, dolores, proyectos)
      "memory_summary": "Resumen narrativo de lo ocurrido en esta sesión para la memoria a largo plazo.",
      "action_items": ["Tarea pendiente 1"]
    }
    Devuelve SOLO el JSON.
    `;

    try {
      const result = await generateText(prompt, "gemini-2.5-flash");
      const cleanJson = result.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleanJson);

      // 2. ACTUALIZAR PERFIL (personal_profile.md)
      if (data.profile_updates && data.profile_updates.length > 0) {
        const profilePath = path.join(process.cwd(), "data", "users", currentUser, "personal_profile.md");
        const newEntries = data.profile_updates.map((u: string) => `- ${u}`).join("\n");
        await fs.appendFile(profilePath, `\n\n## Agregado ${new Date().toLocaleDateString()}\n${newEntries}`);
      }

      // 3. ACTUALIZAR MEMORIA (memory.md)
      if (data.memory_summary) {
        const memoryPath = path.join(process.cwd(), "data", "users", currentUser, "memory", "memory.md");
        const entry = `\n### Sesión ${new Date().toLocaleString()}\n${data.memory_summary}\n`;
        await fs.appendFile(memoryPath, entry);
      }

      // 4. LIMPIAR DRAFT
      await contextLoader.updateDraft("# Draft - Notas en Tiempo Real\n\n(Limpio tras consolidación)\n");

      await channel.send(`
      ✅ **Consolidación Finalizada**
      
      📋 **Perfil Actualizado:** ${data.profile_updates.length} nuevos datos.
      🧠 **Memoria:** Sesión archivada.
      🧹 **Draft:** Limpio.
      `);

    } catch (error) {
      console.error(error);
      await channel.send("❌ Error al consolidar. El JSON generado por Gemini falló.");
    }
  }
}