import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { Chronos } from './src/core/chronos';
import { Archivist } from './src/core/archivist';
import { calculateStressLevel } from './src/core/stress-manager';
import { getAvailableModels } from './src/core/gemini-client';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

let activeModel: any; 

async function getSorenResponse(prompt: string, systemPrompt: string) {
    // Protección por si intentamos usarlo antes de elegir
    if (!activeModel) throw new Error("⚠️ El modelo no ha sido inicializado.");

    const chat = activeModel.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 2000 },
        systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
}

// 👇 FUNCIÓN PARA ELEGIR CEREBRO
async function selectModel() {
    console.log(chalk.yellow("📡 Conectando con Google AI para ver modelos disponibles..."));
    
    try {
        const models = await getAvailableModels();
        
        // Ordenamos para que los modelos más nuevos (1.5) salgan primero
        const sortedModels = models.sort((a, b) => {
             const scoreA = a.displayName.includes('1.5') ? 2 : 1;
             const scoreB = b.displayName.includes('1.5') ? 2 : 1;
             return scoreB - scoreA;
        });

        // Usamos Inquirer para la lista interactiva
        const { selectedModelName } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedModelName',
                message: '🧠 Selecciona el cerebro para esta sesión:',
                choices: sortedModels.map(m => ({
                    name: `${chalk.bold(m.displayName)} ${chalk.gray(`(${m.name.replace('models/', '')})`)}`,
                    value: m.name.replace('models/', '') 
                })),
                pageSize: 12
            }
        ]);

        console.log(chalk.green(`✅ Cerebro activado: ${selectedModelName}\n`));
                activeModel = genAI.getGenerativeModel({ model: selectedModelName });

    } catch (error) {
        console.error(chalk.red("❌ Error obteniendo lista. Usando fallback (gemini-1.5-flash)."));
        activeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
}

async function main() {
    console.clear();
    console.log("🔮 SØREN MIRROR - SYSTEM V2 🔮");
    console.log("-------------------------------");

    // 👇 LLAMADA DE BLOQUEO (Espera a que elijas antes de seguir)
    await selectModel();

    
    // INICIALIZAR MÓDULOS COGNITIVOS
    const chronos = new Chronos();    
    // CARGAR PERSONALIDAD "WRITER"
    // ... (resto de tu código original: personaPath, basePersona, bucle while, etc.)
    const personaPath = path.join(__dirname, 'docs', 'vision', 'private_persona.md');
    const stressThreshold = 7; // Umbral de estrés para activar alertas
    
    
    // Solo asegúrate de copiar el resto de tu función main() aquí abajo
    const basePersona = fs.existsSync(personaPath) 
        ? fs.readFileSync(personaPath, 'utf-8') 
        : "Eres Søren, un editor brutalmente honesto.";

    
    const chatHistory: { user: string, soren: string }[] = [];
    let lastMessageTime = Date.now(); 

    console.log(chalk.green(`\n✅ Conectado. Escribe para comenzar. ('salir' para guardar y terminar)`));

    while (true) {
        if (chronos.shouldInterrupt()) {
            console.log(chalk.redBright("\n\n--- ⚠️ ALERTA DE FATIGA ESTOCÁSTICA (CHRONOS) ---"));
            break; 
        }

        const { prompt } = await inquirer.prompt([{
            type: 'input',
            name: 'prompt',
            message: chalk.cyan('Vos:')
        }]);

        if (prompt.toLowerCase() === 'salir') break;

        const stressScore = calculateStressLevel(prompt, lastMessageTime);
        lastMessageTime = Date.now();

        let stressInstruction = "";
        if (stressScore >= stressThreshold) {
            stressInstruction = "\n\nNota: El usuario parece estar bajo un alto nivel de estrés. Responde con empatía y ofrece apoyo.";
            console.log(chalk.redBright("⚠️ Nivel de estrés detectado en el usuario. Ajustando respuesta..."));
        }

        const finalSystemPrompt = `${basePersona}${stressInstruction}`;

        try {
            process.stdout.write(chalk.gray("Søren piensa..."));
            const response = await getSorenResponse(prompt, finalSystemPrompt);
            process.stdout.write("\r" + " ".repeat(20) + "\r");
            
            console.log(chalk.magenta('Søren: ') + response);
            chatHistory.push({ user: prompt, soren: response });

        } catch (error: any) {
            console.error(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    if (chatHistory.length > 0) {
        Archivist.saveSession(chatHistory);
    }

    console.log(chalk.bold("\nFin de la sesión."));
}

main();