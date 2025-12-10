// src/commands/AuthCommand.ts

import { IChannel } from "../channels/IChanel.js";
import { LocalAuthManager } from "../core/auth.js";
import { SorenCommand } from "../dispatcher/soren-command.js";

export class AuthCommand extends SorenCommand {
  name = "auth";
  description =
    "Autenticarse o registrar (auth <login|register> <username> <password>)";
  parameters = ["action", "username", "password"];

  private authManager = new LocalAuthManager();

  async execute(args: string[], channel: IChannel): Promise<void> {
    try {
      const [action, username, password] = args;

      if (!action || !username || !password) {
        await channel.send(
          `❌ Uso: auth <login|register> <username> <password>`
        );
        return;
      }

      if (action === "login") {
        const isValid = await this.authManager.loginUser(username, password);
        if (isValid) {
          await channel.send(`✅ Bienvenido, ${username}`);
        } else {
          await channel.send(`❌ Credenciales inválidas`);
        }
      } else if (action === "register") {
        const success = await this.authManager.registerUser(username, password);
        if (success) {
          await channel.send(`✅ Usuario '${username}' registrado`);
        } else {
          await channel.send(`❌ El usuario ya existe o hubo un error`);
        }
      } else {
        await channel.send(`❌ Acción desconocida. Usa 'login' o 'register'`);
      }
    } catch (error) {
      await this.handleError(error as Error, channel);
    }
  }
}
