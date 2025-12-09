import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

// --- IMPORTS DEL NÚCLEO ---
import { Chronos } from './src/core/chronos';
import { Archivist } from './src/core/archivist';
import { StressManager } from './src/core/stress-manager';
import { LocalAgent, SorenMode } from './src/core/ollama-client';
import { GlobalMemory } from './src/core/memory'; 
import { getAvailableModels } from './src/core/gemini-client';
import { IdentityManager } from './src/core/identity';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

let activeGeminiModel: any;           
let localBrain: LocalAgent;           

async function selectModel() {
    console.log(chalk.yellow("📡 Conectando con Google AI..."));
    try {
        const models = await getAvailableModels();
        const sortedModels = models.sort((a, b) => 
             (b.displayName.includes('1.5') ? 1 : 0) - (a.displayName.includes('1.5') ? 1 : 0)
        );

        const { selectedModelName } = await inquirer.prompt([{
            type: 'list',
            name: 'selectedModelName',
            message: '🧠 Selecciona el CEREBRO LÓGICO (Gemini):',
            choices: sortedModels.map(m => ({
                name: `${m.displayName} ${chalk.gray(`(${m.name.replace('models/', '')})`)}`,
                value: m.name.replace('models/', '')
            })),
            pageSize: 10
        }]);

        activeGeminiModel = genAI.getGenerativeModel({ model: selectedModelName });
        console.log(chalk.green(`✅ Núcleo Lógico: ${selectedModelName}`));
        
        localBrain = new LocalAgent('dolphin-llama3'); 
        console.log(chalk.green(`✅ Núcleo Local: Dolphin-Llama3 (Ready)`));

    } catch (error) {
        console.error("❌ Fallo en selección. Usando defaults.");
        activeGeminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        localBrain = new LocalAgent();
    }
}

// --- PIPELINE HÍBRIDO ---
async function procesarRespuestaHibrida(
    inputUsuario: string, 
    stressLevel: number, 
    memory: GlobalMemory 
): Promise<string> {
    
    const historiaReciente = memory.getRecentHistory(4000);
    
    const promptGemini = `
    HISTORIAL CONTEXTUAL: ${historiaReciente}
    USUARIO: ${inputUsuario}
    INSTRUCCIÓN: Genera una respuesta técnica, lógica y precisa. Ignora estilo, céntrate en código y lógica.
    `;
    
    const chat = activeGeminiModel.startChat();
    const result = await chat.sendMessage(promptGemini);
    const rawContent = result.response.text();

    const promptRefinamiento = `
    INPUT ORIGINAL: "${rawContent}"

    TU IDENTIDAD: Søren Architect (Hacker, Pragmático, Directo).
    TU MISIÓN:
    1. Reescribe la respuesta anterior adoptando tu identidad.
    2. Nivel de Estrés del Usuario: ${stressLevel}/10. 
       ${stressLevel > 7 ? "-> El usuario está MUY estresado. Sé breve y calmado." : "-> El usuario está calmado. Explayate."}
    3. Elimina frases de relleno.
    4. Si hay código, preséntalo sin rodeos.
    5. Prioriza la estructura, claridad y documentación.
    6. Docs as code: La documentación se trata igual que al código.
    `;

    return await localBrain.chat(SorenMode.ARCHITECT, promptRefinamiento);
}

// --- MAIN LOOP ---
async function main() {
    console.clear();
    console.log("🔮 SØREN MIRROR - IDENTITY SYSTEM (v4.0) 🔮");
    
    const identityMgr = new IdentityManager();
    const existingUsers = identityMgr.getExistingIdentities();
    
    let memory: GlobalMemory;
    let currentIdentity = "";

    // 1. LOGIN
    const { loginMode } = await inquirer.prompt([{
        type: 'list',
        name: 'loginMode',
        message: 'Identificación de Acceso:',
        choices: [
            ...existingUsers.map(u => ({ name: `📂 Cargar perfil: [${u}]`, value: u })),
            { name: '✨ Nueva Sesión (Generar Identidad)', value: 'NEW' }
        ]
    }]);

    if (loginMode === 'NEW') {
        const { firstPrompt } = await inquirer.prompt([{
            type: 'input', name: 'firstPrompt', message: chalk.cyan('Escribe tu primera instrucción (esto definirá tu apodo):')
        }]);
        console.log(chalk.gray("Analizando patrón de escritura..."));
        
        currentIdentity = await identityMgr.generateIdentity(firstPrompt);
        console.log(chalk.green(`\n🆔 Identidad Asignada: [ ${chalk.bold(currentIdentity)} ]`));
        
        memory = new GlobalMemory(currentIdentity);
        memory.appendInteraction('USER', firstPrompt);
        
    } else {
        currentIdentity = loginMode;
        console.log(chalk.green(`\n✅ Identidad cargada: ${currentIdentity}`));
        memory = new GlobalMemory(currentIdentity);
    }

    // ⬇️ AQUÍ ES DONDE AGREGAMOS EL STRESS MANAGER VINCULADO AL USUARIO ⬇️
    const stressTracker = new StressManager(currentIdentity); 
    
    // PREDECIMOS EL FUTURO ANTES DE EMPEZAR
    const baseStress = stressTracker.predictBaseStress();
    if (baseStress > 0) {
        console.log(chalk.magenta(`📉 [PREDICCIÓN] Estrés histórico base para hoy: ${baseStress.toFixed(1)}/10`));
        // Truco: Le pasamos un string vacío para "cargar" ese estrés inicial en la sesión
        // (Asumiendo que modificaste StressManager para no bajar el estrés si recibe string vacío, 
        // o simplemente confiamos en que el primer prompt ajustará el nivel).
    }

    await selectModel(); 

    const chronos = new Chronos();
    const chatHistory: { user: string, soren: string }[] = [];

    console.log(chalk.green(`\n✅ Sistema listo. Escribe 'salir' para terminar.`));

    while (true) {
        if (chronos.shouldInterrupt()) {
            console.log(chalk.redBright("\n⚠️  [CHRONOS] Fatiga detectada. Cierre forzoso."));
            break; 
        }

        const { prompt } = await inquirer.prompt([{
            type: 'input', name: 'prompt', message: chalk.cyan(`[${currentIdentity}] >`)
        }]);

        if (prompt.toLowerCase() === 'salir') break;

        memory.appendInteraction('USER', prompt);

        // Usamos la instancia local 'stressTracker'
        const currentStress = stressTracker.updateAndGetStress(prompt);
        
        const stressBar = "█".repeat(Math.ceil(currentStress));
        const stressColor = currentStress > 7 ? chalk.red : chalk.gray;
        console.log(stressColor(`[Stress: ${currentStress.toFixed(1)} ${stressBar}]`));

        process.stdout.write(chalk.gray("Pensando (Nube -> Local)..."));
        
        try {
            const respuesta = await procesarRespuestaHibrida(prompt, currentStress, memory);
            
            process.stdout.write("\r" + " ".repeat(30) + "\r");
            console.log(chalk.magenta('Søren Code: ') + respuesta);

            memory.appendInteraction('SØREN', respuesta);
            chatHistory.push({ user: prompt, soren: respuesta });

        } catch (error: any) {
            console.error(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    if (chatHistory.length > 0) Archivist.saveSession(chatHistory);
    console.log("\nFin de sesión.");
}

main();