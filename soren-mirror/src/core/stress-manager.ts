export type StressIntensity = 'LOW' | 'MEDIUM' | 'CRITICAL';

export interface StressResponse {
  shouldIntervene: boolean;
  intensity: StressIntensity;
  probabilityUsed: number; // Para estadísticas futuras 
}

/**
 * Calcula la intervención basada en probabilidad estocástica creciente.
 * A mayor tiempo, mayor probabilidad de que el "dado" caiga en contra.
 */

export function calculateStressLevel(minutes: number): StressResponse {
  // ZONA SEGURA (Flow State)
  if (minutes < 45) {
    return { shouldIntervene: false, intensity: 'LOW', probabilityUsed: 0 };
  }

  if (minutes >= 120) {
    return { shouldIntervene: true, intensity: 'CRITICAL', probabilityUsed: 1.0 };
  }

  // 3. ZONA ESTOCÁSTICA (La "Ruleta Rusa" del TDAH)
  // Normalizamos el tiempo entre 0.0 y 1.0 en el rango de 45 a 120 min.
  const riskFactor = (minutes - 45) / (120 - 45);
  
  // Tiramos el dado (Random Float entre 0.0 y 1.0)
  const diceRoll = Math.random();

  // Si el dado es MENOR que el factor de riesgo, intervenimos.
  // Ej: Si riskFactor es 0.8 (muy cansado), es muy fácil que diceRoll sea menor.
  const shouldIntervene = diceRoll < riskFactor;

  return {
    shouldIntervene,
    intensity: shouldIntervene ? 'MEDIUM' : 'LOW',
    probabilityUsed: riskFactor
  };
}