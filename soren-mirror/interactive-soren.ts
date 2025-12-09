import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';

// IMPORTS
import { Chronos } from './src/core/chronos';
import { Archivist } from './src/core/archivist';
import { LocalAgent, SorenMode } from './src/core/ollama-client';
import { getAvailableModels } from './src/core/gemini-client';
import { IdentityManager } from './src/core/identity';
import { ProjectManager } from './src/core/project-manager';
import { GlobalMemory } from './src/core/memory';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

let activeGeminiModel: any;
let localBrain: LocalAgent;
let currentPersonaMode: SorenMode = SorenMode.ARCHITECT; 
let activeProject: string | null = null; 
let projectNickname: string = ""; 

// --- PANTALLA DE INICIO (SALUDO) ---
async function systemBoot() {
    console.clear();
    console.log(chalk.gray("Iniciando núcleos..."));
    await new Promise(r => setTimeout(r, 800)); // Efecto dramático
    console.clear();
    console.log(chalk.bold.cyan(`
    ███████╗ ██████╗ ██████╗ ███████╗███╗   ██╗
    ██╔════╝██╔═══██╗██╔══██╗██╔════╝████╗  ██║
    ███████╗██║   ██║██████╔╝█████╗  ██╔██╗ ██║
    ╚════██║██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║
    ███████║╚██████╔╝██║  ██║███████╗██║ ╚████║
    ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
            Mirror System v6.5 (Secured)
    `));
    console.log(chalk.gray("-----------------------------------------------"));
    console.log(chalk.white("Hola. Soy Søren. Tu espejo cognitivo."));
    console.log(chalk.gray("Antes de acceder a mis funciones, necesito saber quien chota sos.\n"));
}

// --- LOGIN FLOW ---
async function authenticationFlow(identityMgr: IdentityManager): Promise<boolean> {
    const users = identityMgr.getExistingIdentities();
    
    // Si no hay usuarios, forzamos registro
    const initialChoice = users.length > 0 
        ? await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Protocolo de Acceso:',
            choices: [
                { name: '🔐 Iniciar Sesión', value: 'LOGIN' },
                { name: '✨ Crear Nueva Identidad', value: 'REGISTER' }
            ]
        }])
        : { action: 'REGISTER' };

    if (initialChoice.action === 'LOGIN') {
        const { selectedUser } = await inquirer.prompt([{
            type: 'list', name: 'selectedUser', message: 'Usuario:', choices: users
        }]);
        
        const { password } = await inquirer.prompt([{
            type: 'password', name: 'password', message: 'Contraseña:', mask: '*'
        }]);

        console.log(chalk.yellow("Verificando..."));
        if (identityMgr.loginUser(selectedUser, password)) {
            console.log(chalk.green(`🔓 Acceso concedido. Bienvenido, ${selectedUser}.`));
            return true;
        } else {
            console.log(chalk.red("⛔ Contraseña incorrecta."));
            return false;
        }

    } else {
        // REGISTRO
        console.log(chalk.cyan("\n--- CREACIÓN DE IDENTIDAD ---"));
        console.log("Para asignarte un perfil, necesito conocer tu 'vibra' actual.");
        
        const { vibePrompt } = await inquirer.prompt([{
            type: 'input', name: 'vibePrompt', message: 'Dime algo sobre vos o cómo te sentís hoy:'
        }]);

        console.log(chalk.gray("Analizando patrones..."));
        const suggestedName = await identityMgr.suggestNickname(vibePrompt);
        
        const { confirmedName } = await inquirer.prompt([{
            type: 'input', name: 'confirmedName', message: 'Apodo sugerido (puedes editarlo):', default: suggestedName
        }]);

        const { newPassword } = await inquirer.prompt([{
            type: 'password', name: 'newPassword', message: 'Crea una contraseña segura:', mask: '*'
        }]);

        if (identityMgr.registerUser(confirmedName, newPassword)) {
            console.log(chalk.green(`✅ Identidad '${confirmedName}' encriptada y guardada.`));
            return true;
        }
        return false;
    }
}

// --- SELECCIÓN DE MODELO ---
async function selectModel() {
    // ... (Tu código de selección de modelo existente, sin cambios) ...
    // Solo asegurate de inicializar localBrain y activeGeminiModel aquí
    try {
        const models = await getAvailableModels();
        const sortedModels = models.sort((a, b) => (b.displayName.includes('1.5') ? 1 : 0) - (a.displayName.includes('1.5') ? 1 : 0));
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

// --- PROCESAMIENTO HÍBRIDO (Igual que antes) ---
async function procesarRespuestaHibrida(input: string, contextProject: string, currentUser: string): Promise<string> {
    // ... (Mismo código que te pasé en el paso anterior, con el switch de personalidades) ...
    // Para abreviar, asumimos que copias la función 'procesarRespuestaHibrida' completa aquí
    // Recordá importar fs si lo usás dentro.
    
    // (Pega aquí la función procesarRespuestaHibrida que definimos previamente)
    // ...
    return "Respuesta simulada si no pegaste la función"; // Placeholder
}

// --- MAIN ---
async function main() {
    await systemBoot(); // 1. Saludo

    const identityMgr = new IdentityManager();
    const isAuthenticated = await authenticationFlow(identityMgr); // 2. Login/Register

    if (!isAuthenticated) {
        console.log(chalk.red("Abortando sistema."));
        process.exit(1);
    }

    const currentUser = IdentityManager.getCurrentUser();
    
    // 3. SELECCIÓN DE MODO (Protegido por el login anterior)
    const { personaSelected } = await inquirer.prompt([{
        type: 'list',
        name: 'personaSelected',
        message: '🎭 Selecciona el MODO:',
        choices: [
            { name: '✒️  Søren Writer (Privado - Literario)', value: SorenMode.WRITER },
            { name: '🏗️  Søren Architect (Privado - Código)', value: SorenMode.ARCHITECT },
            { name: '🌐 Søren Public (Público - Portfolio)', value: SorenMode.PUBLIC }
        ]
    }]);
    currentPersonaMode = personaSelected;

    // 4. INICIO DE SISTEMAS Y PROYECTOS
    const projectManager = new ProjectManager(currentUser);
    
    // Lógica de Proyectos (Solo Writer)
    if (currentPersonaMode === SorenMode.WRITER) {
        const projects = projectManager.getProjects();
        const creativeProjects = projects.filter(p => p !== 'soren-mirror'); // Ocultamos el sistema

        const { projectChoice } = await inquirer.prompt([{
            type: 'list', name: 'projectChoice', message: '📖 Proyecto Activo:',
            choices: [...creativeProjects.map(p => ({ name: `📂 ${p}`, value: p })), { name: '✨ Nuevo Proyecto', value: 'NEW' }]
        }]);

        if (projectChoice === 'NEW') {
            const { newName } = await inquirer.prompt([{ type: 'input', name: 'newName', message: 'Título:' }]);
            const { newStyle } = await inquirer.prompt([{ type: 'input', name: 'newStyle', message: 'Estilo:', default: 'Existencialista' }]);
            const { newContext } = await inquirer.prompt([{ type: 'input', name: 'newContext', message: 'Contexto inicial:' }]);
            projectManager.createProject(newName, newContext, newStyle);
            activeProject = newName;
        } else {
            activeProject = projectChoice;
        }
    }

    await selectModel(); // Selección de IA

    // --- BUCLE DE CHAT ---
    const chronos = new Chronos();
    const chatHistory: { user: string, soren: string }[] = [];
    console.log(chalk.green(`\n✅ Conectado como [${currentUser}]. Escribe 'salir' para cerrar.`));

    while (true) {
        if (chronos.shouldInterrupt()) break;

        const { prompt } = await inquirer.prompt([{
            type: 'input', name: 'prompt', message: chalk.cyan(activeProject ? `[${activeProject}] >` : 'Vos >')
        }]);

        if (prompt.toLowerCase() === 'salir') break;

        // Carga de contexto seguro
        const context = activeProject ? projectManager.loadProjectContext(activeProject) : "";
        
        process.stdout.write(chalk.gray("Procesando..."));
        
        // NOTA: Asegurate de tener la función procesarRespuestaHibrida definida arriba
        const respuesta = await procesarRespuestaHibrida(prompt, context, currentUser);
        
        process.stdout.write("\r" + " ".repeat(20) + "\r");
        console.log(chalk.magenta(`Søren: `) + respuesta);

        if (activeProject) {
            projectManager.appendToProjectMemory(activeProject, `User: ${prompt}\nSoren: ${respuesta}`);
        }
        chatHistory.push({ user: prompt, soren: respuesta });
    }

    if (chatHistory.length > 0 && !activeProject) Archivist.saveSession(chatHistory);
    console.log("\nSesión finalizada.");
}

main();