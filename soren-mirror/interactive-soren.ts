import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { browseFileSystem } from './src/utils/file.browser';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// --- FUNCIÓN PARA LISTAR MODELOS GEMINI ---
async function listGeminiModels() {
    console.log(chalk.gray("📡 Consultando modelos disponibles en Google AI..."));
    try {
        // Hacemos un fetch manual porque el SDK a veces oculta modelos legacy/beta
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        
        if (!data.models) return [];

        // Filtramos solo los que sirven para generar contenido (chat)
        return data.models
            .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
            .map((m: any) => ({
                name: m.displayName || m.name,
                value: m.name.replace('models/', '') // Limpiamos el prefijo
            }))
            .sort((a: any, b: any) => b.value.localeCompare(a.value)); // Ordenamos los más nuevos primero
    } catch (error) {
        console.error(chalk.red("Error listando modelos, usando defaults."));
        return [
            { name: 'Gemini 1.5 Flash (Rápido)', value: 'gemini-1.5-flash' },
            { name: 'Gemini 1.5 Pro (Potente)', value: 'gemini-1.5-pro' },
        ];
    }
}

// --- GENERACIÓN CON STREAMING (Para velocidad) ---
async function streamGeminiResponse(prompt: string, modelName: string, systemPrompt?: string) {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
    });

    const result = await model.generateContentStream(prompt);
    
    let fullText = "";
    process.stdout.write(`🤖 ${chalk.magenta('Soren:')} `);

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText); // Escribimos a medida que llega
        fullText += chunkText;
    }
    console.log("\n"); // Salto de línea al final
    return fullText;
}

async function getOllamaResponse(prompt: string, modelName: string, systemPrompt?: string) {
    // Simplemente devolvemos el texto completo por compatibilidad rápida
    const response = await fetch(`${process.env.OLLAMA_HOST || 'http://localhost:11434'}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName, prompt, system: systemPrompt, stream: false }),
    });
    const data = await response.json();
    return data.response;
}

async function main() {
    console.clear();
    console.log("🔮 SOREN MIRROR - CLI v2.0 (Streaming) 🔮");
    console.log("-------------------------------------------");

    // A. Cargar Identidad
    const personaPath = path.join(__dirname, 'docs', 'vision', 'public_persona.md');
    let sorenPersona = fs.existsSync(personaPath) ? fs.readFileSync(personaPath, 'utf-8') : "Eres Søren.";

    // B. Selección de Motor y Modelo
    const { provider } = await inquirer.prompt([{
        type: 'list',
        name: 'provider',
        message: 'Motor de Inteligencia:',
        choices: [
            { name: 'Google Gemini (Cloud)', value: 'gemini' },
            { name: 'Ollama (Local)', value: 'ollama' }
        ]
    }]);

    let modelName: string;
    let runChat: any; // Función ejecutora

    if (provider === 'gemini') {
        const models = await listGeminiModels();
        const { selectedModel } = await inquirer.prompt([{
            type: 'list',
            name: 'selectedModel',
            message: 'Selecciona el modelo de Gemini:',
            choices: models,
            pageSize: 10
        }]);
        modelName = selectedModel;
        runChat = streamGeminiResponse; // Usamos la versión Stream
    } else {
        modelName = 'dolphin-mistral'; // O listar modelos de ollama/api/tags si quisieras
        runChat = async (p: string, m: string, s: string) => {
            const txt = await getOllamaResponse(p, m, s);
            console.log(`🤖 ${chalk.magenta('Soren:')} ${txt}\n`);
        };
    }

    // C. Navegador de Archivos (Contexto)
    console.log(chalk.cyan("\n📂 Contexto de la Sesión:"));
    const selectedFile = await browseFileSystem();
    
    // Si el nodo del FileSystem tiene un 'path' real, leemos el archivo del disco.
    let technicalContext = selectedFile.content || "";
    
    // Hack para leer archivos reales si definimos 'realPath' en el file-system.ts
    // (Esto responde a tu pedido de usar READMEs reales)
    if ((selectedFile as any).realPath) {
        try {
            technicalContext = fs.readFileSync((selectedFile as any).realPath, 'utf-8');
            console.log(chalk.gray(`   (Leído desde disco: ${(selectedFile as any).realPath})`));
        } catch (e) {
            console.error(chalk.red("   (No se pudo leer el archivo real, usando fallback)"));
        }
    }

    const finalSystemPrompt = `
    ${sorenPersona}
    
    === CONTEXTO ACTIVO ===
    ${technicalContext}
    =======================
    `;

    // D. Chat Loop
    console.log(chalk.green(`\n✅ Conectado a ${modelName}.`));
    
    while (true) {
        const { prompt } = await inquirer.prompt([{
            type: 'input',
            name: 'prompt',
            message: chalk.green('Vos:')
        }]);

        if (prompt.toLowerCase() === 'salir') break;

        try {
            await runChat(prompt, modelName, finalSystemPrompt);
        } catch (error: any) {
            console.error(chalk.red(`❌ Error: ${error.message}`));
        }
    }
}

main();