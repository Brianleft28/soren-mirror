import inquirer from "inquirer";
import { IChannel } from "./IChanel.js";

export class ConsoleChannel implements IChannel {
  private isInteractive: boolean = true;

  constructor(isInteractive: boolean = true) {
    this.isInteractive = isInteractive;
  }

  async send(message: string): Promise<void> {
    console.log(message);
  }

  async read(): Promise<string> {
    if (!this.isInteractive) {
      return ""; // No hay input en modo no-interactivo
    }

    const { input } = await inquirer.prompt([
      {
        type: "input",
        name: "input",
        message: "> ",
        prefix: "🔮",
      },
    ]);
    return input;
  }

  getType(): "console" | "telegram" | "web" {
    return "console";
  }
}
