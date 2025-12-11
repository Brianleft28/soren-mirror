import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { SorenOrchestrator } from "./src/orchestrator/soren-orchestator.js";
import fs  from "fs";
import { TelegramAgent } from "./src/agents/telegram-agent.js";
import { ConsoleAgent } from "./src/agents/console-agent.js";
import { SessionManager } from "./src/core/sesion-manager.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const candidatePaths = [
  path.join(__dirname, "..", "..", ".env"), 
  path.join(__dirname, "..", ".env"), 
  path.join(__dirname, ".env") 
];

let loadedEnvPath: string | null = null;
for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, debug: true });
    loadedEnvPath = p;
    break;
  }
}

if (!loadedEnvPath) {
  dotenv.config({ debug: true }); 
}



  // Crear una ÚNICA instancia de SessionManager
  const sessionManager = new SessionManager();

async function main() {
  console.log(
    "GEMINI_API_KEY:",
    process.env.GEMINI_API_KEY ? "✅ Cargado" : "❌ NO CARGADO"
  );
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  if (telegramToken) {
    const telegramAgent = new TelegramAgent(telegramToken, sessionManager);
    telegramAgent.start(); 

  } else {
    console.warn("⚠️  TELEGRAM_BOT_TOKEN no encontrado. El bot de Telegram no se iniciará.");
  }

  const consoleAgent = new ConsoleAgent();
  consoleAgent.start(); 
}


main().catch(console.error);