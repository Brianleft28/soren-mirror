// src/dispatcher/SorenCommand.ts
import { IChannel } from "../channels/IChanel.js";

export abstract class SorenCommand {
  abstract name: string;
  abstract description: string;
  abstract parameters: string[];

  abstract execute(args: string[], channel: IChannel): Promise<void>;

  protected async handleError(error: Error, channel: IChannel): Promise<void> {
    await channel.send(`❌ Error en ${this.name}: ${error.message}`);
  }

  protected validateArgs(args: string[], expectedCount: number): boolean {
    return args.length >= expectedCount;
  }
}
