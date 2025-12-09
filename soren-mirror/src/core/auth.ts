import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

// Define tu contraseña en el archivo .env como SOREN_PASSWORD=tu_clave
const MASTER_PASSWORD = process.env.SOREN_PASSWORD || "existencia";

export async function authenticateUser(): Promise<boolean> {
    const { inputPassword } = await inquirer.prompt([{
        type: 'password',
        name: 'inputPassword',
        message: chalk.red('ACCESO DENNEGADO. ¿Quién chota sos?:'),
        mask: '*'
    }]);

    if (inputPassword === MASTER_PASSWORD) {
        console.log(chalk.green('Bienvenido, Pibe. La que se viene es heavy.'));
        return true;
    } else {
        console.log(chalk.red('⛔ Acceso denegado.'));
        return false;
    }
}