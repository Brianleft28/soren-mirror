// src/commands/HelpCommand.ts
import { IChannel } from "../channels/IChanel.js";
import { SorenCommand } from "../dispatcher/soren-command.js";

export class HelpCommand extends SorenCommand {
  name = "help";
  description = "Mostrar comandos disponibles";
  parameters = [];

  // Pasamos los comandos registrados
  private allCommands: Map<string, SorenCommand> = new Map();

  setCommands(commands: Map<string, SorenCommand>): void {
    this.allCommands = commands;
  }

  async execute(_args: string[], channel: IChannel): Promise<void> {
    let help = "📚 Lista de comandos disponibles:\n";
    for (const [name, cmd] of this.allCommands) {
      help += `  ${name.padEnd(10)} - ${cmd.description}\n`;
    }
    await channel.send(help);
  }
}
