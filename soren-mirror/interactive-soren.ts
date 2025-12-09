import inquirer from 'inquirer';
import chalk from 'chalk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

// IMPORTS DEL NÚCLEO
import { Chronos } from './src/core/chronos.js';
import { LocalAgent, SorenMode } from './src/core/ollama-client.js';
import { getAvailableModels } from './src/core/gemini-client.js';
import { IdentityManager } from './src/core/identity.js';
import { ProjectManager } from './src/core/project-manager.js';
import { GlobalMemory } from './src/core/memory.js';
import { StressManager } from './src/core/stress-manager.js';

dotenv.config();

// --- VARIABLES GLOBALES ---
const OLLAMA_HOST_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

let activeGeminiModel: any;
let localBrain: LocalAgent;
let currentPersonaMode: SorenMode = SorenMode.ARCHITECT;
let activeProject: string | null = null;

// --- HELPERS ---
function loadFileContent(filePath: string): string {
    // __dirname no existe en ES Modules, usamos esta alternativa.
    const scriptDir = path.dirname(new URL(import.meta.url).pathname);
    // Construimos la ruta absoluta subiendo un nivel desde /dist
    const absolutePath = path.resolve(scriptDir, '..', filePath);
    try {
        return fs.readFileSync(absolutePath, 'utf-8');
    } catch (e) {
        return `Error: No se encontró el archivo de contexto en ${absolutePath}.`;
    }
}

// --- PANTALLA DE INICIO ---
async function systemBoot() {
    console.clear();
    console.log(chalk.gray("Iniciando núcleos..."));
    await new Promise(r => setTimeout(r, 800));
    console.clear();
    console.log(chalk.bold.cyan(`
    ███████╗ ██████╗ ██████╗ ███████╗███╗   ██╗
    ██╔════╝██╔═══██╗██╔══██╗██╔════╝████╗  ██║
    ███████╗██║   ██║██████╔╝█████╗  ██╔██╗ ██║
    ╚════██║██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║
    ███████║╚██████╔╝██║  ██║███████╗██║ ╚████║
    ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
            Mirror System v0.8 (API Connected)
    `));
    console.log(chalk.gray("-----------------------------------------------"));
    console.log(chalk.white("Bienvenido, soy Søren."));
    console.log(chalk.gray("Antes de acceder a mis funciones, necesito saber quien chota sos.\n"));
}

// --- FLUJO DE AUTENTICACIÓN (CONECTADO A LA API) ---
async function authenticationFlow(identityMgr: IdentityManager): Promise<boolean> {
    const { action } = await inquirer.prompt([{
        type: 'list', name: 'action', message: 'Protocolo de Acceso (Søren Core API):',
        choices: [ { name: '🔐 Iniciar Sesión', value: 'LOGIN' }, { name: '✨ Crear Nueva Identidad', value: 'REGISTER' } ]
    }]);

    if (action === 'LOGIN') {
        const { username } = await inquirer.prompt([{ type: 'input', name: 'username', message: 'Usuario:' }]);
        const { password } = await inquirer.prompt([{ type: 'password', name: 'password', message: 'Contraseña:', mask: '*' }]);
        console.log(chalk.yellow("📡 Autenticando con el microservicio..."));
        if (await identityMgr.loginUser(username, password)) {
            console.log(chalk.green(`🔓 Enlace establecido. Bienvenido, ${username}.`));
            return true;
        } else {
            console.log(chalk.red("⛔ Credenciales inválidas o error del servidor."));
            return false;
        }
    } else { // REGISTER
        const { vibePrompt } = await inquirer.prompt([{ type: 'input', name: 'vibePrompt', message: 'Define tu vibración actual:' }]);
        console.log(chalk.gray("Calculando alias..."));
        const suggestedName = await identityMgr.suggestNickname(vibePrompt);
        const { confirmedName } = await inquirer.prompt([{ type: 'input', name: 'confirmedName', message: 'Identidad:', default: suggestedName }]);
        const { newPassword } = await inquirer.prompt([{ type: 'password', name: 'newPassword', message: 'Password:', mask: '*' }]);
        if (await identityMgr.registerUser(confirmedName, newPassword)) {
            console.log(chalk.green(`✅ Usuario '${confirmedName}' registrado en la base de datos.`));
            return true;
        } else {
            console.log(chalk.red("❌ Error al registrar. ¿El usuario ya existe?"));
            return false;
        }
    }
}

// --- SELECCIÓN DE MODELO DE IA (GEMINI) ---
async function selectModel(): Promise<string> {
    try {
        const models = await getAvailableModels();
        if (models.length === 0) {
            console.log(chalk.yellow("⚠️ No se encontraron modelos de Gemini o la API Key es inválida. Usando 'gemini-1.5-flash' por defecto."));
            activeGeminiModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({ model: "gemini-1.5-flash" });
            return "gemini-1.5-flash";
        }

        const sortedModels = models.sort((a: any, b: any) => (b.displayName.includes('1.5') ? 1 : 0) - (a.displayName.includes('1.5') ? 1 : 0));
        const { selectedModelName } = await inquirer.prompt([{
            type: 'list', name: 'selectedModelName', message: '🧠 Cerebro Lógico (Gemini):',
            choices: sortedModels.map((m: any) => ({ name: m.displayName, value: m.name.replace('models/', '') }))
        }]);
        activeGeminiModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({ model: selectedModelName });
        return selectedModelName;
    } catch (error) {
        console.log(chalk.yellow("⚠️ Error inesperado al seleccionar modelo. Usando 'gemini-1.5-flash'."));
        activeGeminiModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({ model: "gemini-1.5-flash" });
        return "gemini-1.5-flash";
    }
}


// --- PROCESAMIENTO HÍBRIDO (ARQUITECTURA POLIMÓRFICA) ---
async function procesarRespuestaHibrida(inputUsuario: string, contextProject: string, currentUser: string, memory: GlobalMemory): Promise<string> {
    
    // 1. Cargar la base universal de la personalidad de Søren.
    const basePersona = loadFileContent('./docs/vision/base_persona.md');
    
    // 2. Cargar el perfil personal del creador y la auto-consciencia del sistema.
    const personalProfile = loadFileContent('./docs/context/personal_profile.md');
    const projectMgr = new ProjectManager(currentUser);
    const sorenSelfContext = projectMgr.loadProjectContext("soren-mirror");

    // 3. Cargar la especialización del rol actual.
    let rolEspecificoPath = '';
    switch (currentPersonaMode) {
        case SorenMode.ARCHITECT: rolEspecificoPath = './docs/vision/architect_persona.md'; break;
        case SorenMode.WRITER:    rolEspecificoPath = './docs/vision/private_persona.md'; break;
        case SorenMode.PUBLIC:    rolEspecificoPath = './docs/vision/public_persona.md'; break;
    }
    const rolEspecifico = loadFileContent(rolEspecificoPath);

    // 4. Construir el System Prompt final de forma dinámica.
    const systemInstruction = `
        ${basePersona}

        --- ROL ACTIVO ---
        ${rolEspecifico}
        
        --- CONTEXTO ADICIONAL ---
        [CREADOR (Brian)]: ${personalProfile}
        [AUTO-CONSCIENCIA (Este Proyecto)]: ${sorenSelfContext}
        [PROYECTO ACTIVO DEL USUARIO]: ${contextProject}
        [MEMORIA RECIENTE DE CHAT]: ${memory.getRecentHistory(1000)}

        --- TAREA ACTUAL ---
        INPUT DEL USUARIO: "${inputUsuario}"
    `;

    // 5. GEMINI (Lógica y Razonamiento con el prompt completo)
    const chat = activeGeminiModel.startChat();
    const result = await chat.sendMessage(systemInstruction);
    const rawContent = result.response.text();

    // 6. OLLAMA (Filtro de Estilo final, usando el mismo system prompt para consistencia)
    const promptRefinamiento = `Re-escribe este texto con tu voz y estilo: "${rawContent}"`;
    const respuestaFinal = await localBrain.chat(currentPersonaMode, promptRefinamiento, systemInstruction);

    // 7. Guardar en memoria global
    memory.appendInteraction('USER', inputUsuario);
    memory.appendInteraction('SØREN', respuestaFinal);

    return respuestaFinal;
}


// --- FUNCIÓN PRINCIPAL DE LA APLICACIÓN (FLUJO CORREGIDO) ---
async function main() {
    await systemBoot();

    // VERIFICAR E INICIALIZAR GEMINI
    if (!initializeGemini()) {
        console.log(chalk.red("Abortando sistema. La API de Gemini es necesaria para continuar."));
        process.exit(1);
    }

    //  SELECCIONAR MODELO DE GEMINI
    const geminiModelName = await selectModel();
    localBrain = new LocalAgent('dolphin-llama3', OLLAMA_HOST_URL);

    // 3. INICIALIZAR IDENTITY MANAGER
    const identityMgr = new IdentityManager(OLLAMA_HOST_URL, geminiModelName);

    // 4. AUTENTICAR AL USUARIO
    const isAuthenticated = await authenticationFlow(identityMgr);
    if (!isAuthenticated) {
        console.log(chalk.red("Abortando sistema."));
        process.exit(1);
    }
    }

    // 4. OBTENER USUARIO ACTUAL (SOLO DESPUÉS DE AUTENTICAR)
    const currentUser = IdentityManager.getCurrentUser();
    if (!currentUser) {
        console.log(chalk.red("Error crítico: No se pudo obtener el usuario actual tras el login."));
        process.exit(1);
    }

    // 5. SELECCIONAR MODO/PERSONA
    const { personaSelected } = await inquirer.prompt([{
        type: 'list', name: 'personaSelected', message: '🎭 Selecciona el MODO:',
        choices: [
            { name: '🏗️  Søren Architect (Privado - Código)', value: SorenMode.ARCHITECT },
            { name: '✒️  Søren Writer (Privado - Literario)', value: SorenMode.WRITER },
            { name: '🌐 Søren Public (Público - Portfolio)', value: SorenMode.PUBLIC }
        ]
    }]);
    currentPersonaMode = personaSelected;

    // 6. INICIALIZAR MÓDULOS CON EL USUARIO CORRECTO
    const projectManager = new ProjectManager(currentUser);
    const stressManager = new StressManager(currentUser);
    const memory = new GlobalMemory(currentUser);
    const chronos = new Chronos();

    // Lógica para crear el proyecto soren-mirror si no existe (Auto-Consciencia)
    if (!projectManager.getProjects().includes("soren-mirror")) {
        projectManager.createProject("soren-mirror", "Técnico, Open Source, Autorreferencial", loadFileContent('./docs/soren-mirror/technical-manifesto.md'));
    }

    // Lógica de selección de proyecto de escritura
    if (currentPersonaMode === SorenMode.WRITER) {
        const projects = projectManager.getProjects();
        const creativeProjects = projects.filter((p: string) => p !== 'soren-mirror');
        const { projectChoice } = await inquirer.prompt([{
            type: 'list', name: 'projectChoice', message: '📖 Proyecto Activo:',
            choices: [...creativeProjects.map((p: string) => ({ name: `📂 ${p}`, value: p })), { name: '✨ Nuevo Proyecto', value: 'NEW' }]
        }]);
        if (projectChoice === 'NEW') {
            const { newName } = await inquirer.prompt([{ type: 'input', name: 'newName', message: 'Título:' }]);
            const { newStyle } = await inquirer.prompt([{ type: 'input', name: 'newStyle', message: 'Estilo:', default: 'Existencialista' }]);
            const { newContext } = await inquirer.prompt([{ type: 'input', name: 'newContext', message: 'Contexto inicial (Manifiesto):' }]);
            projectManager.createProject(newName, newStyle, newContext);
            activeProject = newName;
        } else {
            activeProject = projectChoice;
        }
    }

    console.log(chalk.green(`\n✅ Conectado como [${currentUser}]. Escribe 'salir' para cerrar.`));

    // Predicción de estrés inicial
    const baseStress = stressManager.predictBaseStress();
    if (baseStress > 0.5) {
        console.log(chalk.yellow(`⚡ Nivel de estrés predicho para esta hora: ${baseStress.toFixed(2)}/10`));
    }

    // --- BUCLE DE CHAT PRINCIPAL ---
    while (true) {
        if (chronos.shouldInterrupt()) {
            console.log(chalk.red.bold("\n[CHRONOS] Alerta de fatiga estocástica. Tómate un descanso."));
            break;
        }

        const { prompt } = await inquirer.prompt([{
            type: 'input', name: 'prompt', message: chalk.cyan(activeProject ? `[${activeProject}] >` : 'Vos >')
        }]);

        if (prompt.toLowerCase() === 'salir') break;

        const currentStress = stressManager.updateAndGetStress(prompt);
        // console.log(chalk.gray(`Nivel de estrés actual: ${currentStress.toFixed(2)}`)); // Descomentar para debug

        const projectData = activeProject ? projectManager.loadProject(activeProject) : null;
        const context = projectData ? projectData.manifest : "Sin proyecto activo.";
        
        process.stdout.write(chalk.gray("Procesando..."));

        const respuesta = await procesarRespuestaHibrida(prompt, context, currentUser, memory);

        process.stdout.write("\r" + " ".repeat(20) + "\r");
        console.log(chalk.magenta(`Søren: `) + respuesta);

        if (activeProject) {
            projectManager.appendToMemory(activeProject, `User: ${prompt}\nSoren: ${respuesta}`);
        }
    }

    console.log("\nSesión finalizada.");
}

main();