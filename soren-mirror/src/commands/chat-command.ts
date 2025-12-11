// ...existing code...
import { SorenCommand } from "../dispatcher/soren-command.js";
import { IChannel } from "../channels/IChanel.js";
import { SessionManager } from "../core/sesion-manager.js";
import { ContextLoader } from "../core/context-loader.js";
import { GlobalMemory } from "../core/memory.js";
import { generateText } from "../core/gemini-client.js";
import { runAnalysis } from "../core/analysis.js";
import { SorenMode } from "../core/ollama-client.js";

export class ChatCommand extends SorenCommand {
  name = "chat";
  description = "Chatea con Søren: chat <mensaje>";
  parameters = ["mensaje"];

  private sessionManager: SessionManager;

  constructor(sessionManager: SessionManager) {
    super();
    this.sessionManager = sessionManager;

    const model =
    this.sessionManager.getPersona?.() ||
    process.env.GEMINI_DEFAULT_MODEL ||
    "gemini-2.5-flash";
  }

  async execute(args: string[], channel: IChannel): Promise<void> {
    try {  
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
      const analysisSystem1 = `
        Eres Søren (pensamiento interno). No generes una respuesta final para el usuario.
        Analiza el INPUT y devuelve:
        - 1 línea de resumen breve,
        - 2-3 riesgos/consideraciones técnicas o emocionales,
        - 1 idea accionable prioritaria.
        Mantén formato compacto (bullets) y tono técnico/empático.
        `;
      const analysisPrompt1 = `${analysisSystem1}\nINPUT:\n${rawText}\n\nCONTEXT:\n${analysisBase}`;

      const analysisResult = await runAnalysis(
        analysisPrompt1,
        contexts,
        "gemini-2.5-flash"
      );

      // Guardar "pensamiento" en memoria separada (no lo escribimos al draft por defecto)
      memory.appendInteraction("SOREN-THOUGHTS", analysisResult);
      
      // 2) Llamada de SÍNTESIS (respuesta al usuario) - usa el análisis como input
      const persona = await this.sessionManager.getPersona();
      let synthesisSystem = "";
      let respuestaFinal = "";

      if (persona === SorenMode.ARCHITECT) {
        synthesisSystem = `
          Eres Søren, asistente técnico de voz arquitectónica y fatalmente serio y argentino.
          Genera UNA respuesta accionable para el usuario en dos secciones.:
          (1) Resumen claro del problema/solución (max 6 líneas).
          (2) Prioridad técnica / arquitectónica (Max. 3 líneas).
          (3) Un paso accionable inmediato (Max. 2 oración).
          Usa el análisis interno como contexto, no repitas todo el análisis.
        `;
      } else if (persona === SorenMode.WRITER) {
        synthesisSystem = `
          Eres Søren, un escritor y asistente empático con tono reflexivo y sereno.
          Genera una respuesta para el usuario que contenga:
          (1) Una reflexión corta sobre su situación (máx. 4 líneas).
          (2) Una pregunta abierta para invitar a la introspección.
          (3) Un pequeño consejo o pensamiento para cerrar.
          Usa el análisis interno como guía, pero responde de forma humana y cercana.
        `;
      } else {
        // Modo por defecto o si no se ha seleccionado ninguno
        await channel.send("🔮 No has seleccionado un modo. Usa /writer o /architect.");
        return;
      }

      const synthesisPrompt = `${synthesisSystem}\nANÁLISIS INTERNO:\n${analysisResult}\n\nINPUT ORIGINAL:\n${rawText}\n\nCONTEXT:\n${synthesisBase}`;

      respuestaFinal = await generateText(
        synthesisPrompt,
        "gemini-2.5-flash",
        synthesisBase
      );

      // Guardar en memoria global (Søren visible)
      memory.appendInteraction("SOREN", respuestaFinal);

      await channel.send(respuestaFinal);
    }
    catch (error) {
      console.error("Error en ChatCommand:", error);
      await channel.send("❌ Ocurrió un error procesando tu solicitud.");
    }
  }
}
