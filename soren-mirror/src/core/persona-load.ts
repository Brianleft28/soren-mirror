import fs from 'fs/promises';
import path from 'path';

export async function loadPublicPersona(): Promise<string> {
    try {
        // Ajusta la ruta relativa según donde ejecutes el script. 
        // Asumiendo ejecución desde root soren-mirror/
        const personaPath = path.resolve('docs/vision/public_persona.md');
        const content = await fs.readFile(personaPath, 'utf-8');
        console.log("✅ Public persona cargada correctamente.");
        return content;
    } catch (error) {
        console.error("❌ Error crítico: No se pudo cargar docs/vision/public_persona.md");
        console.error("Søren no tiene identidad sin este archivo.");
        process.exit(1);
    }
}