export function calculateStressLevel(
  currentMessage: string, 
  lastMessageTime: number // Timestamp
): number {
  const now = Date.now();
  const timeDeltaSec = (now - lastMessageTime) / 1000;
  
  // Métrica 1: Velocidad (Verborragia)
  const wordCount = currentMessage.trim().split(/\s+/).length;
  // Si tardó 2 segs en escribir 50 palabras -> CopyPaste o Manía pura.
  const wpm = (wordCount / timeDeltaSec) * 60; 

  // Métrica 2: Densidad / Gritos
  const isScreaming = currentMessage === currentMessage.toUpperCase() && wordCount > 5;
  const isRant = wordCount > 100 && !currentMessage.includes('\n'); // Bloque de texto sin aire

  let stressScore = 0; // 0 a 10

  if (wpm > 100) stressScore += 4; // Muy acelerado
  if (isScreaming) stressScore += 3;
  if (isRant) stressScore += 3;

  // Retorna un valor para que el LLM sepa cómo responder (ej. "Usuario en estado maníaco, bajar voltaje")
  return stressScore; 
}