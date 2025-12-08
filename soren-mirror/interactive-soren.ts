import inquirer from 'inquirer';
import chalk from 'chalk'; // Asegúrate de importar chalk
import { generateText, getAvailableModels } from './src/core/gemini-client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config(); // Cargar variables de entorno

const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY || "");

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
  const modelChoices = await rawModels.map(m => ({
    name: `${m.displayName} (${m.name.replace('models/', '')})`,
    description: m.description,
    value: m.name
  }));

  const formattedChoices = modelChoices.map((model) => {
      return {
          // Concatenamos el nombre y la descripción pintada
          name: `${chalk.bold(model.name)} ${chalk.dim('— ' + model.description)}`, 
          value: model.value
      };
  });

  // Preguntar qué modelo usar (ahora con lista real)
  if (formattedChoices.length === 0) {
          console.error("❌ No hay modelos disponibles.");
          return;
      }
let { selectedModel } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedModel',
            message: '¿Qué cerebro querés utilizar?',
            choices: formattedChoices, 
            pageSize: 10

        }
    ]);
  console.log(`\n🧠 Cerebro activado: ${selectedModel}\n`);

 console.log(chalk.cyan("💬 Escribe tu mensaje (o 'salir' para terminar):"));

while (true) {
    const { prompt } = await inquirer.prompt([
        {
            type: 'input',
            name: 'prompt',
            message: chalk.green('Tú:'), // Ponemos "Tú" en verde
        }
    ]);

    if (prompt.toLowerCase() === 'salir') {
        console.log(chalk.yellow("¡Hasta luego! 👋"));
        break;
    }

    // Feedback visual de que está "pensando"
    process.stdout.write(chalk.gray("⏳ Pensando...")); 

    try {
        // Obtenemos el modelo seleccionado (asegúrate de tener la variable 'model' configurada con el 'selectedModel')
        // Si necesitas re-instanciar el modelo aquí dentro con el nombre seleccionado:
        const currentModel = genAI.getGenerativeModel({ model: selectedModel }); 

        const result = await currentModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Borramos la línea de "Pensando..." y mostramos la respuesta
        // \r mueve el cursor al inicio de la línea para sobrescribir
        console.log(`\r🤖 ${chalk.magenta('Gemini:')} ${text}\n`);

    } catch (error: any) {
        // Aquí capturamos el error 429 o cualquier otro
        console.log("\n"); // Limpiamos la línea

        if (error.message && error.message.includes('429')) {
            console.error(chalk.bgRed.white.bold(" ⛔ LÍMITE DE CUOTA EXCEDIDO (Error 429) "));
            console.error(chalk.yellow(`
            Posibles causas:
            1. Estás usando un modelo "Preview" (como 2.5 Flash) con límites muy bajos.
            2. Tu proyecto no tiene vinculada la cuenta de facturación en Google Cloud.
            
            👉 Intenta seleccionar un modelo estable como 'gemini-1.5-flash'.
            `));
      // volver a listar los modelos para que el usuario elija otro
      const { newSelectedModel } = await inquirer.prompt([
        {
            type: 'list',
            name: 'newSelectedModel',
            message: '¿Qué cerebro querés utilizar?',
            choices: formattedChoices, 
            pageSize: 10
        }
    ]);
      selectedModel = newSelectedModel;

        } else {
            // Otros errores
            console.error(chalk.red(`❌ Ocurrió un error inesperado: ${error.message}`));
        }
    }
}
}
main();