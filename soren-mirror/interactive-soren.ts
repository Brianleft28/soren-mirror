import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

dotenv.config(); // Cargar variables de entorno

const API_KEY = process.env.GEMINI_API_KEY;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

const genAI = new GoogleGenerativeAI(API_KEY || "");

// --- Funciones de Cliente (Modificadas para aceptar un system prompt) ---

/**
 * Genera texto usando un modelo de Gemini, aplicando un prompt de sistema.
 */
async function getGeminiResponse(prompt: string, modelName: string, systemPrompt?: string) {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt, // <-- Aquí se inyecta la personalidad
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

/**
 * Genera texto usando un modelo de Ollama, aplicando un prompt de sistema.
 */
async function getOllamaResponse(prompt: string, modelName: string, systemPrompt?: string) {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: modelName,
            prompt: prompt,
            system: systemPrompt, // <-- Aquí se inyecta la personalidad
            stream: false
        }),
    });

    if (!response.ok) {
        throw new Error(`Error en la comunicación con Ollama: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
}

async function main() {
    console.clear();
    console.log("🔮 SOREN MIRROR - CLI INTERACTIVA 🔮");
    console.log("-------------------------------------");

    // 1. Cargar la personalidad de Soren desde el archivo
    const personaPath = path.join(__dirname, '..', 'docs', 'vision', 'public_persona.md');
    if (!fs.existsSync(personaPath)) {
        console.error(chalk.red(`❌ No se encontró el archivo de personalidad en: ${personaPath}`));
        return;
    }
    const sorenPersona = fs.readFileSync(personaPath, 'utf-8');
    console.log(chalk.blue('Personalidad de Soren cargada.'));


    // 2. PREGUNTAR QUÉ MOTOR USAR
    const { provider } = await inquirer.prompt([
        {
            type: 'list',
            name: 'provider',
            message: '¿Qué motor de IA querés utilizar?',
            choices: [
                { name: 'Ollama (dolphin-mistral - Local)', value: 'ollama' },
                { name: 'Gemini (gemini-1.5-flash - Cloud)', value: 'gemini' }
            ]
        }
    ]);

    let modelName: string;
    let generateResponse: (prompt: string, model: string, systemPrompt?: string) => Promise<string>;

    if (provider === 'ollama') {
        modelName = 'dolphin-mistral';
        generateResponse = getOllamaResponse;
        console.log(`\n🧠 Cerebro activado: Ollama (${chalk.yellow(modelName)})\n`);
    } else {
        modelName = 'gemini-1.5-flash-latest';
        generateResponse = getGeminiResponse;
        console.log(`\n🧠 Cerebro activado: Google (${chalk.cyan(modelName)})\n`);
    }

    console.log(chalk.cyan("💬 Habla con Soren (o escribe 'salir' para terminar):"));

    // 3. BUCLE DE CHAT
    while (true) {
        const { prompt } = await inquirer.prompt([
            {
                type: 'input',
                name: 'prompt',
                message: chalk.green('Vos:'),
            }
        ]);

        if (prompt.toLowerCase() === 'salir') {
            console.log(chalk.yellow("¡Hasta luego! 👋"));
            break;
        }

        process.stdout.write(chalk.gray("⏳ Soren está pensando..."));

        try {
            // Pasamos la personalidad como el "system prompt" en cada llamada
            const text = await generateResponse(prompt, modelName, sorenPersona);

            const responsePrefix = `🤖 ${chalk.magenta('Soren:')}`;
            process.stdout.write(`\r${responsePrefix} ${text}\n\n`);

        } catch (error: any) {
            process.stdout.write("\r");
            console.error(chalk.red(`❌ Ocurrió un error: ${error.message}`));
        }
    }
}

main();