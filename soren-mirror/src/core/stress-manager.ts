import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'metrics');

// Aseguramos que la carpeta exista
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StressEntry {
    timestamp: number;
    level: number;
    trigger: string; // El prompt que causó el estrés
}

export class StressManager {
    private currentStress: number = 0;
    private lastInteractionTime: number = Date.now();
    private userId: string;
    private historyPath: string;

    // Configuración de sensibilidad
    private readonly DECAY_RATE = 0.1; 
    private readonly MAX_STRESS = 10;

    constructor(userId: string = 'default_user') {
        this.userId = userId;
        this.historyPath = path.join(DATA_DIR, `${userId}_stress_log.json`);
    }

    /**
     * Predicción Estocástica:
     * Analiza tu historial para ver cómo sueles estar a esta hora y día.
     * Retorna un "Stress Base" inicial.
     */
    public predictBaseStress(): number {
        if (!fs.existsSync(this.historyPath)) return 0;

        try {
            const rawData = fs.readFileSync(this.historyPath, 'utf-8');
            const history: StressEntry[] = JSON.parse(rawData);
            
            const now = new Date();
            const currentHour = now.getHours();
            const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes...

            // Filtramos entradas de la misma hora y día de la semana (histórico)
            const relevantEntries = history.filter(entry => {
                const date = new Date(entry.timestamp);
                return date.getHours() === currentHour && date.getDay() === currentDay;
            });

            if (relevantEntries.length === 0) return 0;

            // Calculamos promedio
            const sum = relevantEntries.reduce((acc, curr) => acc + curr.level, 0);
            const predicted = sum / relevantEntries.length;

            console.log(`🔮 [STOCHASTIC PREDICTION] Históricamente, tu estrés los ${this.getDayName(currentDay)} a las ${currentHour}h es de nivel ${predicted.toFixed(1)}.`);
            
            return predicted; // Este será tu estrés inicial hoy

        } catch (error) {
            console.error("Error leyendo historial de estrés:", error);
            return 0;
        }
    }

    /**
     * Calcula, actualiza y PERSISTE el estrés actual.
     */
    public updateAndGetStress(userPrompt: string): number {
        const now = Date.now();
        const timeDeltaSeconds = (now - this.lastInteractionTime) / 1000;
        
        // Decay (Enfriamiento)
        const stressReduction = timeDeltaSeconds * this.DECAY_RATE;
        this.currentStress = Math.max(0, this.currentStress - stressReduction);

        // Análisis del Input actual
        const density = userPrompt.length / 50; 
        const shouting = (userPrompt.match(/[A-Z]/g) || []).length / userPrompt.length > 0.3 ? 2 : 0;
        const speedPenalty = timeDeltaSeconds < 5 ? 1.5 : 0; // Escribir muy rápido

        const newLoad = density + shouting + speedPenalty;
        this.currentStress = Math.min(this.MAX_STRESS, this.currentStress + newLoad);
        
        // PERSISTENCIA 
        this.saveToHistory(this.currentStress, userPrompt);

        this.lastInteractionTime = now;
        return parseFloat(this.currentStress.toFixed(2));
    }

    private saveToHistory(level: number, trigger: string) {
        let history: StressEntry[] = [];
        
        if (fs.existsSync(this.historyPath)) {
            try {
                history = JSON.parse(fs.readFileSync(this.historyPath, 'utf-8'));
            } catch { history = []; }
        }

        // Solo guardamos picos significativos o muestras periódicas para no llenar el disco
        // (O guardamos todo si queremos data pura para ML futuro)
        history.push({
            timestamp: Date.now(),
            level: parseFloat(level.toFixed(2)),
            trigger: trigger.substring(0, 50) // Guardamos solo el inicio para contexto
        });

        fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
    }

    private getDayName(dayIndex: number): string {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[dayIndex];
    }
}