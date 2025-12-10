import { generateText } from "./gemini-client.js";
import { DualMemory, LoadedContexts } from "./context-loader.js";

export async function runAnalysis(
  rawText: string,
  contexts: LoadedContexts,
  model: string
): Promise<string> {
  const analysisBase = `
--- DRAFT (contexto de trabajo) ---
${contexts.memory.draft}

--- MEMORIA RECIENTE ---
`;

  const analysisSystem = `
Eres Søren (pensamiento interno). No generes una respuesta final para el usuario.
Analiza el INPUT y devuelve:
- 1 línea de resumen breve,
- 2-3 riesgos/consideraciones técnicas o emocionales,
- 1 idea accionable prioritaria.
Mantén formato compacto (bullets) y tono técnico/empático.
`;
  const prompt = `${analysisSystem}\nINPUT:\n${rawText}\n\nCONTEXT:\n${analysisBase}`;

  const result = await generateText(prompt, model, analysisBase);
  return result;
}
