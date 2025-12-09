import fs from 'fs/promises';
import path from 'path';

export async function getFullContext(): Promise<string> {
  const dir = path.join(process.cwd(), 'knowledge');
  const files = await fs.readdir(dir);
    
  let contextBlob = "### BASE DE CONOCIMIENTO PERSONAL (PROYECTOS Y VIDA):\n";

  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = await fs.readFile(path.join(dir, file), 'utf-8');
      contextBlob += `\n--- ARCHIVO: ${file} ---\n${content}\n`;
    }
  }
  return contextBlob;
}