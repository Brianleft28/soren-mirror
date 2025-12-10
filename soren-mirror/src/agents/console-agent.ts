import { ConsoleChannel } from "../channels/console-channel.js";
import { CommandDispatcher } from "../dispatcher/comand-dispatcher.js";
import { SorenCommand } from "../dispatcher/soren-command.js";
import { AuthCommand } from "../commands/auth-command.js";
import { HelpCommand } from "../commands/help-command.js";

export class ConsoleAgent {
  private dispatcher: CommandDispatcher;
  private channel: ConsoleChannel;
  private currentUser: string | null = null;

  constructor() {
    this.dispatcher = new CommandDispatcher();
    this.channel = new ConsoleChannel(true); // Modo interactivo
    this.registerCommands();
  }

  private registerCommands(): void {
    const authCmd = new AuthCommand();
    const helpCmd = new HelpCommand();

    this.dispatcher.register("auth", authCmd);
    this.dispatcher.register("help", helpCmd);

    helpCmd.setCommands(
      new Map<string, SorenCommand>([
        ["auth", authCmd],
        ["help", helpCmd],
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
        await this.channel.send("👋 Hasta luego!");
        break;
      }

      if (!input.trim()) continue;

      const parts = input.trim().split(" ");
      const commandName = parts[0].toLowerCase();
      const args = parts.slice(1);

      await this.dispatcher.execute(commandName, args, this.channel);
    }
  }
}
