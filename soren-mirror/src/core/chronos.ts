/**
 * Módulo Chronos: Gestiona el tiempo de la sesión y la fatiga estocástica.
 * Implementa la lógica de ADR-005.
 */

export class Chronos {
    private startTime: number;
    private readonly MIN_TIME_MINUTES = 45;
    private readonly MAX_TIME_MINUTES = 120;

    constructor() {
        this.startTime = Date.now();
        console.log("🕰️  Chronos activado. El tiempo de sesión ha comenzado.");
    }

    private getSessionDurationInMinutes(): number {
        return (Date.now() - this.startTime) / (1000 * 60);
    }

    /**
     * Calcula la probabilidad de interrupción según ADR-005.
     * @returns {number} Probabilidad entre 0 y 1.
     */
    public getInterruptionProbability(): number {
        const t = this.getSessionDurationInMinutes();

        if (t < this.MIN_TIME_MINUTES) {
            return 0;
        }
        if (t >= this.MAX_TIME_MINUTES) {
            return 1;
        }

        // Fórmula de ADR-005
        const probability = (t - this.MIN_TIME_MINUTES) / (this.MAX_TIME_MINUTES - this.MIN_TIME_MINUTES);
        return probability;
    }

    /**
     * Determina si se debe interrumpir la sesión basado en la probabilidad.
     */

    public shouldInterrupt(): boolean {
        const probability = this.getInterruptionProbability();
        if (probability === 0) return false;
        if (probability === 1) return true;
        
        // El factor sorpresa: tiramos el dado.
        return Math.random() < probability;
    }
}