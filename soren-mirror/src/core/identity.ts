import { LocalAgent, SorenMode } from './ollama-client.js';
import { generateText } from './gemini-client.js';


const API_URL = 'http://soren-core:4000/auth';

export class IdentityManager {
    private localBrain: LocalAgent;
    private static currentUser: string = "";
    private static authToken: string = "";
    private geminiModelName: string; // Para guardar el modelo de Gemini a usar

    // --- CONSTRUCTOR MODIFICADO ---
    constructor(ollamaHostUrl: string, geminiModelName: string) { 
        this.localBrain = new LocalAgent('dolphin-llama3', ollamaHostUrl);
        this.geminiModelName = geminiModelName; // Recibimos y guardamos el modelo
    }

    public static getCurrentUser(): string { return IdentityManager.currentUser; }
    public static getAuthToken(): string { return IdentityManager.authToken; }

    public getExistingIdentities(): string[] {
    
        return [];
    }

  
    // --- BAUTISMO (MODIFICADO) ---
    public async suggestNickname(firstPrompt: string): Promise<string> {
        try {
            const systemContext = "Sos 'El Bautizador', un hacker experto en crear apodos (nicknames) en formato kebab-case. Sos directo y solo respondés con el apodo.";
            const prompt = `Creá un apodo hacker corto, en kebab-case, basado en esta frase: "${firstPrompt}"`;
            
            // 4. USAMOS EL MODELO GUARDADO PARA GENERAR EL APODO
            const raw = await generateText(prompt, this.geminiModelName, systemContext);

            const clean = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
            return (clean.length > 2 && clean.length < 20) ? clean : `user-${Date.now().toString().slice(-4)}`;
        } catch {
            return `user-${Date.now().toString().slice(-4)}`;
        }
    }

    // --- REGISTRO (API NestJS) ---
    public async registerUser(username: string, pass: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: pass })
            });

            if (!res.ok) return false;
            
            // Si registra ok, hacemos login automático
            return this.loginUser(username, pass);
        } catch (error) {
            console.error("❌ Error conectando al Núcleo de Auth:", error);
            return false;
        }
    }

    // --- LOGIN (API NestJS) ---
    public async loginUser(username: string, pass: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: pass })
            });

            if (!res.ok) return false;

            const data = await res.json();

            
            // Guardamos la sesión en RAM
            IdentityManager.currentUser = data.user;
            IdentityManager.authToken = data.access_token;
            
            
            return true;
        } catch (error) {
            console.error("❌ Error de conexión (¿Está corriendo Docker?).");
            return false;
        }
    }
}