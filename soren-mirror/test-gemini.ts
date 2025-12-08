import { generateText } from "./src/core/gemini-client";

async function main() {
  console.log("🧠 Conectando con Soren (Gemini)...");
  
  const prompt = "Hola, ¿quién sos? Responde brevemente como si fueras una IA llamada Soren pibe.";
  
  console.log(`📤 Enviando prompt: "${prompt}"`);
  
  const respuesta = await generateText(prompt);
  
  console.log("\n🤖 Respuesta de Soren:");
  console.log("------------------------------------------------");
  console.log(respuesta);
  console.log("------------------------------------------------");
}

main();