import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { SorenOrchestrator } from "./src/orchestrator/soren-orchestator.js";
import fs  from "fs";

// __dirname en ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Intentar la ubicación más probable para .env (dos niveles arriba para dist)
const candidatePaths = [
  path.join(__dirname, "..", "..", ".env"), // root project (.env)
  path.join(__dirname, "..", ".env"), // soren-mirror/.env
  path.join(__dirname, ".env"), // dist/.env (no usual)
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
  dotenv.config({ debug: true }); // fallback (buscar .env en CWD)
}

console.log("Loaded .env path:", loadedEnvPath ?? "No .env found, using process env");


async function main() {
  console.log(
    "GEMINI_API_KEY:",
    process.env.GEMINI_API_KEY ? "✅ Cargado" : "❌ NO CARGADO"
  );

  try {
    await SorenOrchestrator.boot(process.argv);
  } catch (error) {
    console.error("❌ Error crítico:", error);
    process.exit(1);
  }
}

main();
