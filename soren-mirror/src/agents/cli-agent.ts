// src/agents/cli-agent.ts
import chalk from "chalk";
import { CliChannel } from "../channels/cli-channel.js";
import { CommandDispatcher } from "../dispatcher/comand-dispatcher.js";
import { SorenCommand } from "../dispatcher/soren-command.js";
import { AuthCommand } from "../commands/auth-command.js";
import { HelpCommand } from "../commands/help-command.js";
import { ContextLoader } from "../core/context-loader.js";
import { SessionManager } from "../core/sesion-manager.js";

export class CliAgent {
  private dispatcher: CommandDispatcher;
  private channel: CliChannel;
  private sessionManager: SessionManager;
  private contextLoader: ContextLoader | null = null;
  private currentUser: string | null = null;

  constructor(args: string[]) {
    this.dispatcher = new CommandDispatcher();
    this.channel = new CliChannel(args);
    this.sessionManager = new SessionManager();
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

  private showBootScreen(): void {
    const ascii = chalk.cyan(`
    ███████╗ ██████╗ ██████╗ ███████╗███╗   ██╗
    ██╔════╝██╔═══██╗██╔══██╗██╔════╝████╗  ██║
    ███████╗██║   ██║██████╔╝█████╗  ██╔██╗ ██║
    ╚════██║██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║
    ███████║╚██████╔╝██║  ██║███████╗██║ ╚████║
    ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
    `);
    console.log(ascii);
    console.log(
      chalk.gray(
        "Mirror System v0.8 (Predictable Mirror System v2.8) (c) 2025 - By Brian Benegas"
      )
    );
    console.log(chalk.gray("─".repeat(80)));
  }

  async execute(commandName: string, args: string[]): Promise<void> {
    // Mostrar boot screen
    this.showBootScreen();

    // Si es login, cargar sesión
    if (commandName === "auth" && args[0] === "login") {
      const username = args[1];
      if (username) {
        this.currentUser = username;
        this.sessionManager.startSession(username, 60);
        this.contextLoader = new ContextLoader(username);
        const contexts = await this.contextLoader.loadAll();

        // Mostrar info de sesión
        console.log(chalk.yellow(this.sessionManager.getSessionInfo()));
        console.log(chalk.blue(this.contextLoader.getLoadSummary(contexts)));
      }
    }

    // Ejecutar comando
    await this.dispatcher.execute(
      commandName.toLowerCase(),
      args,
      this.channel
    );

    // Mostrar output
    const output = this.channel.getOutput();
    if (output.length > 0) {
      console.log(chalk.green("\n✓ Output:"));
      output.forEach((line) => console.log(chalk.white(line)));
    }
  }

  getOutput(): string[] {
    return this.channel.getOutput();
  }
}
