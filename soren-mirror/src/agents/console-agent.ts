// src/agents/console-agent.ts
import { ConsoleChannel } from "../channels/console-channel.js";
import { CommandDispatcher } from "../dispatcher/comand-dispatcher.js";
import { SorenCommand } from "../dispatcher/soren-command.js";
import { AuthCommand } from "../commands/auth-command.js";
import { HelpCommand } from "../commands/help-command.js";
import { ChatCommand } from "../commands/chat-command.js"; // nuevo
import { SessionManager } from "../core/sesion-manager.js"; // nuevo

export class ConsoleAgent {
  private dispatcher: CommandDispatcher;
  private channel: ConsoleChannel;
  private currentUser: string | null = null;
  private sessionManager: SessionManager; // agregado

  constructor() {
    this.dispatcher = new CommandDispatcher();
    this.channel = new ConsoleChannel(true); // Modo interactivo
    this.sessionManager = new SessionManager(); // instanciamos sesión aquí
    this.registerCommands();
  }

  private registerCommands(): void {
    // Creamos los comandos pasando sessionManager a los que lo requieren
    const authCmd = new AuthCommand(this.sessionManager); // Ahora recibe sessionManager
    const helpCmd = new HelpCommand();
    const chatCmd = new ChatCommand(this.sessionManager); // ChatCommand usa sessionManager

    this.dispatcher.register("auth", authCmd);
    this.dispatcher.register("help", helpCmd);
    this.dispatcher.register("chat", chatCmd);

    helpCmd.setCommands(
      new Map<string, SorenCommand>([
        ["auth", authCmd],
        ["help", helpCmd],
        ["chat", chatCmd], // listar chat en help
      ])
    );
  }

  async start(): Promise<void> {
    await this.channel.send(`
      -----------------------------------------------
      🪞 Mirror System v0.8 (Console Mode)
      ███████╗ ██████╗ ██████╗ ███████╗███╗   ██╗
      ██╔════╝██╔═══██╗██╔══██╗██╔════╝████╗  ██║
      ███████╗██║   ██║██████╔╝█████╗  ██╔██╗ ██║
      ╚════██║██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║
      ███████║╚██████╔╝██║  ██║███████╗██║ ╚████║
      ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
      
      Predictable Mirror System v2.8 (c) 2024
      -----------------------------------------------
      Escribe 'help' para ver comandos.
      Escribe 'exit' para salir.
    `);

    while (true) {
      const input = await this.channel.read();

      if (input.toLowerCase() === "exit") {
        if (this.sessionManager.isActive()) {
          await this.channel.send(
            `👋 Termino la sesión ${this.sessionManager.getCurrentUser()}`
          );
        }
        await this.channel.send("👋 Chau pibe!");
        break;
      }

      if (!input.trim()) continue;

      const parts = input.trim().split(" ");
      const commandName = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (this.sessionManager.isActive()) {
        await this.channel.send(this.sessionManager.getSessionInfo());
      }

      if (!this.dispatcher.has(commandName)) {
        await this.dispatcher.execute("chat", [input.trim()], this.channel);
      } else {
        await this.dispatcher.execute(commandName, args, this.channel);
      }
    }
  }
}
