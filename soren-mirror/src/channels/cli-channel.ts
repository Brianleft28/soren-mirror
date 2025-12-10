import { IChannel } from "./IChanel.js";

export class CliChannel implements IChannel {
  private args: string[] = [];
  private outputBuffer: string[] = [];

  constructor(args: string[]) {
    this.args = args;
  }

  async send(message: string): Promise<void> {
    this.outputBuffer.push(message);
    console.log(message);
  }

  async read(): Promise<string> {
    return this.args.join(" ");
  }

  getType(): "console" | "telegram" | "web" {
    return "console"; // Técnicamente es CLI, pero respeta la interfaz
  }

  getOutput(): string[] {
    return this.outputBuffer;
  }
}
