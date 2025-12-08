import inquirer from 'inquirer';
import { generateText, getAvailableModels } from './core/gemini-client.js';

async function main() {
  console.clear();
  console.log("🔮 SOREN MIRROR - CLI INTERACTIVA 🔮");
  console.log("-------------------------------------");
  console.log("📡 Conectando con Google para obtener modelos disponibles...");

  // 1. Obtener modelos dinámicamente
  const rawModels = await getAvailableModels();

  if (rawModels.length === 0) {
    console.error("❌ No se pudieron cargar los modelos. Verifica tu API Key.");
    return;
  }

  // Mapeamos los modelos al formato que le gusta a Inquirer
  // value: es el ID técnico (ej: 'models/gemini-1.5-flash')
  // name: es lo que ve el usuario (ej: 'Gemini 1.5 Flash - Fast and versatile')
  const modelChoices = rawModels.map(m => ({
    name: `${m.displayName} (${m.name.replace('models/', '')})`,
    value: m.name
  }));

  // 2. Preguntar qué modelo usar (ahora con lista real)
  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: '¿Qué cerebro quieres utilizar?',
      choices: modelChoices,
      pageSize: 10 // Muestra más opciones antes de hacer scroll
    }
  ]);

  console.log(`\n🧠 Cerebro activado: ${selectedModel}\n`);

  // 3. Bucle de chat
  while (true) {
    const { prompt } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prompt',
        message: 'Tú:',
      }
    ]);

    if (prompt.toLowerCase() === 'salir') break;

    console.log("⏳ Pensando...");
    
    const respuesta = await generateText(prompt, selectedModel);

    console.log(`\n🤖 Soren:`);
    console.log(respuesta);
    console.log("\n-------------------------------------\n");
  }
}

main();