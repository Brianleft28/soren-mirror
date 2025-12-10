import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY no definida.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Interfaz para tipar la respuesta de la lista de modelos
interface ModelInfo {
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods: string[];
}

/**
 * Obtiene dinámicamente la lista de modelos disponibles en tu cuenta de Google AI.
 * Filtra solo aquellos capaces de generar contenido (chat/texto).
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  try {
    // Consultamos la API REST directamente para listar los modelos
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (!data.models) return [];

    // Filtramos para obtener solo los modelos que sirven para 'generateContent'
    return data.models.filter((m: ModelInfo) => 
      m.supportedGenerationMethods.includes("generateContent")
    );
  } catch (error) {
    console.error("Error obteniendo modelos:", error);
    return [];
  }
}


export async function generateText(prompt: string, modelName: string = "gemini-1.5-flash", context?: string): Promise<string> {
  if (!genAI) {
      return "Error: El cliente de Gemini no está inicializado.";
    }
  try {
    // Limpiamos el nombre del modelo si viene con el prefijo "models/"
    const cleanModelName = modelName.replace('models/', '');
    
    const model = genAI.getGenerativeModel({ model: cleanModelName });

    let finalPrompt = prompt;

    if (context) {
      finalPrompt = `
      CONTEXTO DEL SISTEMA:
      ${context}
      
      SOLICITUD:
      ${prompt}
      `;
    }

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Error con modelo ${modelName}:`, error);
    return `Error: No se pudo generar respuesta con ${modelName}.`;
  }
}