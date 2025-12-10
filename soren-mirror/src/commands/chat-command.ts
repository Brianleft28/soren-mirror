// ...existing code...
import { SorenCommand } from "../dispatcher/soren-command.js";
import { IChannel } from "../channels/IChanel.js";
import { SessionManager } from "../core/sesion-manager.js";
import { ContextLoader } from "../core/context-loader.js";
import { GlobalMemory } from "../core/memory.js";
import { generateText } from "../core/gemini-client.js";
import { runAnalysis } from "../core/analysis.js";

export class ChatCommand extends SorenCommand {
  name = "chat";
  description = "Chatea con Søren: chat <mensaje>";
  parameters = ["mensaje"];

  private sessionManager: SessionManager;

  constructor(sessionManager: SessionManager) {
    super();
    this.sessionManager = sessionManager;
  }

  async execute(args: string[], channel: IChannel): Promise<void> {
    try {
    const model =
    this.sessionManager.getPersona?.() ||
    process.env.GEMINI_DEFAULT_MODEL ||
    "gemini-2.5-flash";

      const rawText = args.join(" ").trim();
      if (!rawText) {
        await channel.send(
          "❌ Debes proveer un mensaje para chatear. Uso: chat <mensaje>"
        );
        return;
      }

      const currentUser = this.sessionManager.getCurrentUser();
      if (!currentUser) {
        await channel.send(
          "❌ No hay sesión activa. Por favor autenticate con `auth login <user> <pass>`."
        );
        return;
      }

      // Cargar contexto dual para el usuario
      const contextLoader = new ContextLoader(currentUser);
      const contexts = await contextLoader.loadAll();

      // Memoria global
      const memory = new GlobalMemory(currentUser);
      memory.appendInteraction("USER", rawText);

      // Evitamos "quemar" personal_profile en el análisis: hacemos dos "bases"
      const analysisBase = `
--- DRAFT (contexto de trabajo) ---
${contexts.memory.draft}

--- MEMORIA RECIENTE ---
${memory.getRecentHistory(600)}
`;

      const synthesisBase = `
${contexts.personalProfile}

--- MEMORIA PRINCIPAL ---
${contexts.memory.principal}

--- MEMORIA RECIENTE ---
${memory.getRecentHistory(1200)}
`;

      // REQUIRE GEMINI KEY
      if (!process.env.GEMINI_API_KEY) {
        await channel.send(
          "❌ GEMINI_API_KEY no definida. No puedo responder usando Gemini."
        );
        return;
      }

      // 1) Llamada de ANÁLISIS (pensamiento interno)
      const analysisSystem = `
Eres Søren (pensamiento interno). No generes una respuesta final para el usuario.
Analiza el INPUT y devuelve:
- 1 línea de resumen breve,
- 2-3 riesgos/consideraciones técnicas o emocionales,
- 1 idea accionable prioritaria.
Mantén formato compacto (bullets) y tono técnico/empático.
`;
      const analysisPrompt = `${analysisSystem}\nINPUT:\n${rawText}\n\nCONTEXT:\n${analysisBase}`;

      const analysisResult = await generateText(
        analysisPrompt,
        "gemini-2.5-flash",
        analysisBase
      );

      // Guardar "pensamiento" en memoria separada (no lo escribimos al draft por defecto)
      memory.appendInteraction("SOREN-THOUGHTS", analysisResult);

      // 2) Llamada de SÍNTESIS (respuesta al usuario) - usa el análisis como input
      const synthesisSystem = `
Eres Søren, asistente técnico de voz arquitectónica y compasiva.
Genera UNA respuesta amigable y accionable para el usuario en dos secciones:
(1) Resumen claro del problema/solución (máx 3 líneas).
(2) Un paso accionable inmediato (1 oración).
Usa el análisis interno como contexto, no repitas todo el análisis.
`;

      const synthesisPrompt = `${synthesisSystem}\nANÁLISIS INTERNO:\n${analysisResult}\n\nINPUT ORIGINAL:\n${rawText}\n\nCONTEXT:\n${synthesisBase}`;

      const respuestaFinal = await generateText(
        synthesisPrompt,
        "gemini-2.5-flash",
        synthesisBase
      );

      // Guardar en memoria global (Søren visible)
      memory.appendInteraction("SOREN", respuestaFinal);

      // Actualizar Draft: solo append la interacción final (no thoughts)
      const updatedDraft =
        contexts.memory.draft +
        `\n[USER] ${rawText}\n[SOREN] ${respuestaFinal}\n`;
      await contextLoader.updateDraft(updatedDraft);

      // Enviar al canal (respuesta final)
      await channel.send(respuestaFinal);
    } catch (error) {
      await this.handleError(error as Error, channel);
    }
  }
}
