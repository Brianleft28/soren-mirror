import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

// IMPORTS
import { Chronos } from './src/core/chronos';
import { Archivist } from './src/core/archivist';
import { LocalAgent, SorenMode } from './src/core/ollama-client';
import { getAvailableModels } from './src/core/gemini-client';
import { IdentityManager } from './src/core/identity';        // <--- RESTAURADO
import { authenticateUser } from './src/core/auth';
import { ProjectManager } from './src/core/project-manager';
import { GlobalMemory } from './src/core/memory';             // <--- RESTAURADO

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

let activeGeminiModel: any;
let localBrain: LocalAgent;
let currentPersonaMode: SorenMode = SorenMode.ARCHITECT; 
let activeProject: string | null = null; 
let projectNickname: string = ""; 

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

// --- 2. PROCESAMIENTO HÍBRIDO ---
async function procesarRespuestaHibrida(input: string, contextProject: string): Promise<string> {
    
    let systemInstruction = "";

    switch (currentPersonaMode) {
        case SorenMode.ARCHITECT:
            systemInstruction = `
            ROL: Arquitecto de Software Senior & Hacker.
            TONO: Rioplatense, técnico, directo.
            INPUT: "${input}"
            OBJETIVO: Solución técnica escalable. Critica si es spaghetti code.
            `;
            break;

        case SorenMode.WRITER:
            // Usamos el apodo del proyecto para darle vida
            systemInstruction = `
            CONTEXTO DEL PROYECTO ("${projectNickname}"):
            ${contextProject}
            
            INPUT USUARIO: "${input}"
            
            OBJETIVO: Editor literario existencialista y rioplatense.
            Empuja al usuario a profundizar. Usa el material del contexto (memory.md).
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
    TU PERSONAJE: ${currentPersonaMode}.
    TAREA: Reescribe el texto base para que coincida con tu personaje (Argentino/Rioplatense).
    `;

    return await localBrain.chat(currentPersonaMode, promptRefinamiento);
}

// --- MAIN LOOP ---
async function main() {
    console.clear();
    console.log("🔮 SØREN MIRROR - CREATIVE SUITE (v6.1 Fixed) 🔮");
    
    // 1. GESTIÓN DE IDENTIDAD (Necesario para saber qué carpeta de proyectos abrir)
    const identityMgr = new IdentityManager();
    const existingUsers = identityMgr.getExistingIdentities();
    let currentIdentity = "";

    const { loginMode } = await inquirer.prompt([{
        type: 'list', name: 'loginMode', message: 'Identificación:',
        choices: [
            ...existingUsers.map(u => ({ name: `📂 ${u}`, value: u })),
            { name: '✨ Nueva Identidad', value: 'NEW' }
        ]
    }]);

    if (loginMode === 'NEW') {
        const { firstPrompt } = await inquirer.prompt([{ type: 'input', name: 'firstPrompt', message: 'Prompt Inicial:' }]);
        currentIdentity = await identityMgr.generateIdentity(firstPrompt);
    } else {
        currentIdentity = loginMode;
    }

    console.log(chalk.green(`🆔 Usuario activo: ${currentIdentity}`));

    // INSTANCIAMOS EL GESTOR DE PROYECTOS CON LA IDENTIDAD
    const projectManager = new ProjectManager(currentIdentity); 

    // SELECCIÓN DE PERSONALIDAD
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

    // 4. LÓGICA DE PROYECTOS (Solo Writer)
    if (currentPersonaMode === SorenMode.WRITER) {
        const isAuth = await authenticateUser();
        if (!isAuth) process.exit(1);

        const projects = projectManager.getProjects(); // Usamos la instancia
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
            const { newName } = await inquirer.prompt([{ type: 'input', name: 'newName', message: 'Título:' }]);
            const { newStyle } = await inquirer.prompt([{ type: 'input', name: 'newStyle', message: 'Estilo (ej: Jazz, Crudo):', default: 'Existencialista' }]);
            const { newContext } = await inquirer.prompt([{ type: 'input', name: 'newContext', message: 'Contexto inicial:' }]);
            
            // ✅ CORRECCIÓN: Usamos 'projectManager' (instancia), NO 'ProjectManager' (clase)
            projectManager.createProject(newName, newContext, newStyle);
            activeProject = newName;
        } else {
            activeProject = projectChoice;
        }

        // FICCIONADOR DE NOMBRES
        if (activeProject) {
            console.log(chalk.gray("Bautizando proyecto..."));
            const promptApodo = `
            NOMBRE: "${activeProject}"
            TAREA: Inventa un apodo literario corto y oscuro para este proyecto.
            SOLO EL APODO.
            `;
            const nick = await localBrain.chat(SorenMode.RAW, promptApodo);
            projectNickname = nick.replace(/["']/g, '').trim();
            
            console.log(chalk.cyan(`\n📚 Contexto cargado: ${activeProject}`));
            console.log(chalk.magenta(`Søren Writer: "A ver qué nos dice hoy '${chalk.bold(projectNickname)}'..."`));
        }
    }

    // INICIO SISTEMA
    await selectModel(); 
    const chronos = new Chronos();
    const chatHistory: { user: string, soren: string }[] = [];

    console.log(chalk.green(`\n✅ Sesión iniciada. Escribe 'salir' para cerrar.`));

    while (true) {
        if (chronos.shouldInterrupt()) break;

        const { prompt } = await inquirer.prompt([{
            type: 'input', name: 'prompt', message: chalk.cyan(activeProject ? `[${projectNickname || activeProject}] >` : 'Vos >')
        }]);

        if (prompt.toLowerCase() === 'salir') break;

        // Recuperamos contexto usando la INSTANCIA
        const currentContext = activeProject 
            ? projectManager.loadProjectContext(activeProject) 
            : "Sesión general sin proyecto.";

        process.stdout.write(chalk.gray("Analizando..."));
        
        try {
            const respuesta = await procesarRespuestaHibrida(prompt, currentContext);
            
            process.stdout.write("\r" + " ".repeat(20) + "\r");
            console.log(chalk.magenta(`Søren: `) + respuesta);

            if (activeProject) {
                // ✅ CORRECCIÓN: Usamos la instancia
                projectManager.appendToProjectMemory(activeProject, `User: ${prompt}\nSoren: ${respuesta}`);
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