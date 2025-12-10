// src/dispatcher/CommandDispatcher.ts
import { IChannel } from "../channels/IChanel.js";
import { SorenCommand } from "./soren-command.js";

export class CommandDispatcher {
  private commands: Map<string, SorenCommand> = new Map();

  register(name: string, command: SorenCommand) {
    this.commands.set(name, command);
  }
  
  has(name: string): boolean {
    return this.commands.has(name);
  }

  async execute(commandName: string, args: string[], channel: IChannel) {
    const command = this.commands.get(commandName);
    if (!command) {
      await channel.send(`❌ Comando no encontrado: ${commandName}`);
      return;
    }
    await command.execute(args, channel);
  }
}
