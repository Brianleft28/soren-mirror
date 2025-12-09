// src/utils/file-browser.ts
import inquirer from 'inquirer';
import { FileNode, fileSystem } from '../config/file-system.js'; // Ajustá la ruta si hace falta

export async function browseFileSystem(currentNode: FileNode = fileSystem): Promise<FileNode> {
    
    // Mapeamos hijos a opciones de Inquirer
    const choices = (currentNode.children || []).map(child => ({
        name: `${child.type === 'folder' ? '📂' : '📄'} ${child.name}`,
        value: child,
        short: child.name
    }));

    // Botón "Volver"
    if (currentNode.name !== 'root') {
        choices.unshift({
            name: '⬅️ .. (Volver)',
            value: { name: 'BACK', type: 'folder' } as any,
            short: '..'
        });
    }

    const { selection } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selection',
            message: `Søren FS > /${currentNode.name}`,
            choices: choices,
            pageSize: 10
        }
    ]);

    // Lógica de navegación
    if (selection.name === 'BACK') {
        return browseFileSystem(fileSystem); // Volver al inicio
    }

    if (selection.type === 'folder') {
        return browseFileSystem(selection); // Recursividad
    }

    return selection; // Devolvemos el archivo seleccionado
}