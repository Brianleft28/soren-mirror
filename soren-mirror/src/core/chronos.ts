import { differenceInMinutes } from 'date-fns'; // O usar Math nativo

export interface SessionState {
  startTime: Date;
  lastBreak: Date;
}

export function analyzeTimeHealth(session: SessionState): string | null {
  const now = new Date();
  const currentHour = now.getHours();
  const minutesActive = differenceInMinutes(now, session.startTime);

  // REGLA DE ORO: El Toque de Queda (23:00 HS)
  // Si son más de las 11 PM, Søren se pone la gorra.
  if (currentHour >= 23 || currentHour < 6) {
    return "🛑 ALERTA DE CICLO CIRCADIANO: Son más de las 23:00. El cerebro ya no compila, solo buclea ansiedad. \n\nComando obligatorio: `shutdown -h now` (A la cama). \n\n¿Guardo el estado actual o cerramos así?";
  }

  // Recordatorio de Necesidades (Hidratación/Postura) cada 60 min
  if (minutesActive > 0 && minutesActive % 60 === 0) {
    return "🥤 CHECK DE MANTENIMIENTO: Pasó una hora. Si no tomaste agua o estiraste la espalda, tu rendimiento va a caer un 15% en los próximos 20 min. Hacelo ahora.";
  }

  return null; // Todo en orden temporal
}

// Tu fórmula de "Gestión de Fatiga Estocástica"
export function calculateInterruptionRisk(minutesActive: number): number {
  if (minutesActive < 45) return 0;
  if (minutesActive < 90) return 0.6; // 60% chance
  return 1.0; // 100% chance (Game over)
}