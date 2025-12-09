import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// IMPORTS
import { Chronos } from './src/core/chronos';
import { Archivist } from './src/core/archivist';
import { LocalAgent, SorenMode } from './src/core/ollama-client';
import { getAvailableModels } from './src/core/gemini-client';
import { IdentityManager } from './src/core/identity';
import { authenticateUser } from './src/core/auth';           // <--- NUEVO
import { ProjectManager } from './src/core/project-manager';  // <--- NUEVO
import { CONNREFUSED } from 'dns';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

let activeGeminiModel: any;
let localBrain: LocalAgent;
let currentPersonaMode: SorenMode = SorenMode.ARCHITECT; 
let activeProject: string | null = null; // El proyecto literario activo

// --- 1. SELECCIÓN DE MODELO ---
async function selectModel() {
    try {
        const models = await getAvailableModels();
        const sortedModels = models.sort((a, b) => 
             (b.displayName.includes('1.5') ? 1 : 0) - (a.displayName.includes('1.5') ? 1 : 0)
        );
        const { selectedModelName } = await inquirer.prompt([{
            type: 'list', name: 'selectedModelName', message: '🧠 Cerebro Lógico (Gemini):',
            choices: sortedModels.map(m => ({ name: m.displayName, value: m.name.replace('models/', '') }))
        }]);
        activeGeminiModel = genAI.getGenerativeModel({ model: selectedModelName });
        localBrain = new LocalAgent('dolphin-llama3'); 
    } catch (error) {
        activeGeminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        localBrain = new LocalAgent();
    }
}
async function procesarRespuestaHibrida(input: string, contextProject: string): Promise<string> {
    
    let systemInstruction = "";

    // 1. DEFINIR EL OBJETIVO SEGÚN LA MÁSCARA
    switch (currentPersonaMode) {
        case SorenMode.ARCHITECT:
            systemInstruction = `
            ROL: Eres un Arquitecto de Software Senior.
            TAREA: Analiza el siguiente input técnico del usuario.
            INPUT: "${input}"
            
            REQUISITOS:
            1. Detecta si hay errores de código, seguridad o malas prácticas.
            2. Genera la solución técnica más eficiente y escalable (SOLID, Clean Arch).
            3. NO redactes la respuesta final a no ser que te lo pidan, solo dame los puntos técnicos clave y el bloque de código corregido.
            `;
            break;

        case SorenMode.WRITER:
            // Lógica Existencial
            systemInstruction = `
            CONTEXTO DEL PROYECTO:
            ${contextProject}
            
            INPUT USUARIO: "${input}"
            
            OBJETIVO: Eres un editor literario existencialista. 
            Empuja al usuario a profundizar en sus emociones. Usa el contexto del proyecto.
            `;
            break;

        default:
            systemInstruction = `Responde al usuario: "${input}"`;
    }

    const chat = activeGeminiModel.startChat();
    const result = await chat.sendMessage(systemInstruction);
    const rawContent = result.response.text();

    const promptRefinamiento = `
    TEXTO BASE: "${rawContent}"
    
    TU PERSONAJE: ${currentPersonaMode === SorenMode.ARCHITECT ? "Hacker Técnico y Frío" : "Escritor Profundo"}.
    
    TAREA:
    Reescribe el texto base para que coincida PERFECTAMENTE con tu personaje.
    - Si eres Hacker: Elimina toda la poesía. Sé técnico.
    - Si eres Escritor: Hazlo emocionalmente frío.
    `;

    return await localBrain.chat(currentPersonaMode, promptRefinamiento);
}

async function main() {
    console.clear();
    console.log("🔮 SØREN MIRROR - CREATIVE SUITE (v6.0) 🔮");
    
    // 1. SELECCIÓN DE PERSONALIDAD
    const { personaSelected } = await inquirer.prompt([{
        type: 'list',
        name: 'personaSelected',
        message: '🎭 Selecciona el MODO:',
        choices: [
            { name: '✒️  Søren Writer (Modo Proyecto Privado)', value: SorenMode.WRITER },
            { name: '🏗️  Søren Architect (Modo Código/Hacker)', value: SorenMode.ARCHITECT },
            { name: '🌐 Søren Public (Modo Portfolio)', value: SorenMode.PUBLIC }
        ]
    }]);
    
    currentPersonaMode = personaSelected;

    if (currentPersonaMode === SorenMode.WRITER) {
        // A. Login
        const isAuth = await authenticateUser();
        console.log(chalk.yellow('Verificando credenciales...'));
        if (!isAuth) process.exit(1);


        // B. Gestión de Proyectos
        const projects = ProjectManager.getProjects();
        const { projectChoice } = await inquirer.prompt([{
            type: 'list',
            name: 'projectChoice',
            message: '📖 ¿En qué obra trabajamos hoy?',
            choices: [
                ...projects.map(p => ({ name: `📂 Abrir: ${p}`, value: p })),
                { name: '✨ Nuevo Proyecto', value: 'NEW' }
            ]
        }]);

        if (projectChoice === 'NEW') {
            const { newName } = await inquirer.prompt([{ type: 'input', name: 'newName', message: 'Título del Proyecto:' }]);
            // Aquí podrías inyectar el texto que subiste como "semilla" inicial
            ProjectManager.createProject(newName, "Inserte aquí fragmentos, traumas o ideas base.");
            activeProject = newName;
        } else {
            activeProject = projectChoice;
        }
        console.log(chalk.cyan(`\n📚 Contexto cargado: ${activeProject}`));
    }

    // INICIO SISTEMA
    await selectModel(); 
    const chronos = new Chronos();
    const chatHistory: { user: string, soren: string }[] = [];

    console.log(chalk.green(`\n✅ Sesión iniciada. Escribe 'salir' para cerrar.`));

    while (true) {
        if (chronos.shouldInterrupt()) break;

        const { prompt } = await inquirer.prompt([{
            type: 'input', name: 'prompt', message: chalk.cyan(activeProject ? `[${activeProject}] >` : 'Vos >')
        }]);

        if (prompt.toLowerCase() === 'salir') break;

        // Recuperamos contexto dinámico (El libro + notas)
        const currentContext = activeProject 
            ? ProjectManager.loadProjectContext(activeProject) 
            : "Sesión general sin proyecto.";

        process.stdout.write(chalk.gray("Analizando..."));
        
        try {
            const respuesta = await procesarRespuestaHibrida(prompt, currentContext);
            
            process.stdout.write("\r" + " ".repeat(20) + "\r");
            console.log(chalk.magenta(`Søren: `) + respuesta);

            if (activeProject) {
                ProjectManager.appendToProjectMemory(activeProject, `User: ${prompt}\nSoren: ${respuesta}`);
            }
            chatHistory.push({ user: prompt, soren: respuesta });

        } catch (error: any) {
            console.error(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    if (chatHistory.length > 0 && !activeProject) Archivist.saveSession(chatHistory);
    console.log("\nFin de sesión.");
}

main();