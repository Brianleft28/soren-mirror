import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { Chronos } from './src/core/chronos';
import { Archivist } from './src/core/archivist';
import { calculateStressLevel } from './src/core/stress-manager';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getSorenResponse(prompt: string, systemPrompt: string) {
    const chat = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 1000 },
        systemInstruction: systemPrompt,
    });
    const result = await chat.sendMessage(prompt);
    return result.response.text();
}

async function main() {
    console.clear();
    console.log("🔮 SØREN WRITER - MODO PRIVADO (v2) 🔮");
    console.log("-----------------------------------------");

    // INICIALIZAR MÓDULOS COGNITIVOS
    const chronos = new Chronos();
    
    // CARGAR PERSONALIDAD "WRITER"
    const personaPath = path.join(__dirname, 'docs', 'vision', 'private_persona.md');
    const basePersona = fs.existsSync(personaPath) 
        ? fs.readFileSync(personaPath, 'utf-8') 
        : "Eres Søren, un editor brutalmente honesto.";

    const chatHistory: { user: string, soren: string }[] = [];
    let lastMessageTime = Date.now(); 

    console.log(chalk.green(`\n✅ Conectado. Escribe para comenzar. ('salir' para guardar y terminar)`));

    // 3. BUCLE DE CHAT CON CAPACIDADES COGNITIVAS
    while (true) {
        // A. Check de Fatiga (Chronos)
        if (chronos.shouldInterrupt()) {
            console.log(chalk.redBright("\n\n--- ⚠️ ALERTA DE FATIGA ESTOCÁSTICA (CHRONOS) ---"));
            console.log(chalk.yellow("Llevas mucho tiempo. Es hora de una pausa obligatoria. La sesión se guardará ahora."));
            break; 
        }

        const { prompt } = await inquirer.prompt([{
            type: 'input',
            name: 'prompt',
            message: chalk.cyan('Vos:')
        }]);

        if (prompt.toLowerCase() === 'salir') break;

        // B. Medición de Estrés (StressManager)
        const stressScore = calculateStressLevel(prompt, lastMessageTime);
        lastMessageTime = Date.now(); // Actualizamos el timestamp para el próximo turno

        let stressInstruction = "";
        if (stressScore > 7) {
            stressInstruction = `\n\nALERTA DE ESTRÉS ALTO (Nivel ${stressScore}/10): El usuario está escribiendo de forma maníaca o muy densa. Tu respuesta debe ser corta, directa y buscar que baje el ritmo. Haz una pregunta simple para que frene.`;
        } else if (stressScore > 4) {
            stressInstruction = `\n\nAVISO DE ESTRÉS MODERADO (Nivel ${stressScore}/10): El usuario está acelerado. Mantén tus respuestas concisas.`;
        }
        
        // Construimos el prompt final para el LLM
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

    // 4. GUARDAR SESIÓN (Archivist)
    if (chatHistory.length > 0) {
        Archivist.saveSession(chatHistory);
    }

    console.log(chalk.bold("\nFin de la sesión."));
}

main();