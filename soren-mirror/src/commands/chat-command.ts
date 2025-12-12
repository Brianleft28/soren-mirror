import { SorenCommand } from "../dispatcher/soren-command.js";
import { IChannel } from "../channels/IChanel.js";
import { SessionManager } from "../core/sesion-manager.js";
import { ContextLoader } from "../core/context-loader.js";
import { GlobalMemory } from "../core/memory.js";
import { generateText } from "../core/gemini-client.js";
import { StressManager } from "../core/stress-manager.js"; //
import { SorenMode } from "../core/gemini-client.js"; // Asumiendo que moviste el Enum aquí, si no, ajusta el import

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
    const startTime = Date.now(); // ⏱️ Iniciamos el reloj

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

      // 1. Carga de Sistemas y Métricas
      const contextLoader = new ContextLoader(currentUser);
      const contexts = await contextLoader.loadAll();
      const memory = new GlobalMemory(currentUser);
      
      // -- ESTRÉS --
      // Instanciamos el manager y calculamos el impacto de este mensaje
      const stressManager = new StressManager(currentUser);
      const currentStress = stressManager.updateAndGetStress(rawText);

      // Registrar input
      memory.appendInteraction("USER", rawText);

      // --- 2. PREPARACIÓN DE CONTEXTO ---

      // Inyectamos Horizonte
      const horizonInfo = contexts.memory.horizonDetected
        ? `⚠️ ALERTA DE HORIZONTE: Pérdida de foco detectada. Análisis: ${contexts.memory.horizonAnalysis}`
        : `✅ Horizonte Claro.`;

      const analysisBase = `
      --- ESTADO COGNITIVO ---
      ${horizonInfo}
      ❤️ Nivel de Estrés Usuario: ${currentStress}/10

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

      // --- 3. FASE DE ANÁLISIS (Subconsciente) ---
      
      const analysisSystem = `
        Eres el subconsciente de Søren. NO generes respuesta al usuario.
        Analiza el INPUT considerando el ESTRÉS (${currentStress}/10).
        
        OBJETIVOS:
        1. ¿El usuario está redundando? (Ver Horizonte).
        2. Si el estrés es alto (>5), sugiere contención (Writer). Si es bajo, estructura técnica (Architect).
        3. Detecta "Puntos de Consolidación" (ideas que merecen ir al perfil).
        `;

      const analysisPrompt = `${analysisSystem}\nINPUT:\n${rawText}\n\nCONTEXT:\n${analysisBase}`;
      
      // Usamos el modelo PRO para pensar (más inteligente)
      const analysisResult = await generateText(
        analysisPrompt,
        "gemini-2.5-pro", 
        analysisBase
      );

      memory.appendInteraction("SOREN-THOUGHTS", analysisResult);

      // --- 4. FASE DE SÍNTESIS (Respuesta) ---
      
      const persona = await this.sessionManager.getPersona();
      let synthesisSystem = "";
      let modelUsed = "gemini-2.5-flash"; // Para el footer

      if (persona === SorenMode.ARCHITECT) {
        synthesisSystem = `
          IDENTIDAD: Eres Søren Architect.
          TONO: Rioplatense, técnico, cínico pero brillante.
          ESTRÉS DETECTADO: ${currentStress}/10.
          
          TU MISIÓN:
          Si el estrés es alto, sé conciso y resolutivo (baja la carga cognitiva).
          Si es bajo, desafía al usuario con mejores prácticas.
          Prioriza la arquitectura y el orden.
          
          ESTRUCTURA:
          1. Diagnóstico.
          2. Solución / Código.
          3. Cierre técnico.
        `;
      } else if (persona === SorenMode.WRITER) {
        synthesisSystem = `
          IDENTIDAD: Eres Søren Writer.
          TONO: Existencialista, argentino, nocturno.
          ESTRÉS DETECTADO: ${currentStress}/10.
          
          TU MISIÓN:
          Eres un espejo emocional.
          Si el estrés es alto, valida su dolor pero ofrece una salida creativa.
          Usa metáforas de ciudad y jazz.
          
          ESTRUCTURA:
          1. Empatía cruda.
          2. Pregunta reflexiva.
          3. Cierre poético.
        `;
      } else {
        synthesisSystem = "Eres Søren. Responde directo con personalidad argentina.";
      }

      const synthesisPrompt = `${synthesisSystem}\n
      ANÁLISIS DE SITUACIÓN:
      ${analysisResult}
      
      INPUT:
      ${rawText}
      
      CONTEXTO:
      ${synthesisBase}
      `;

      const respuestaFinal = await generateText(
        synthesisPrompt,
        modelUsed,
        synthesisBase
      );

      memory.appendInteraction("SOREN", respuestaFinal);

      const updatedDraft = contexts.memory.draft + `\n[USER] ${rawText}\n[SOREN] ${respuestaFinal}\n`;
      await contextLoader.updateDraft(updatedDraft);

      // --- 5. FOOTER CON TELEMETRÍA ---
      const endTime = Date.now();
      const latency = ((endTime - startTime) / 1000).toFixed(2);
      
      const footer = `\n\n\`⚡ ${latency}s | 🌡️ Stress: ${currentStress}/10 | 🧠 ${modelUsed}\``;

      await channel.send(respuestaFinal + footer);

    } catch (error) {
      console.error("Error en ChatCommand:", error);
      await channel.send("❌ Error crítico en el núcleo de Søren.");
    }
  }
}