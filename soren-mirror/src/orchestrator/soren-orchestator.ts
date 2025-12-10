import { ConsoleAgent } from "../agents/console-agent.js";
import { CliAgent } from "../agents/cli-agent.js";

export class SorenOrchestrator {
  /**
   * Punto de entrada único
   * @param argv - process.argv
   */
  static async boot(argv: string[]): Promise<void> {
    const args = argv.slice(2);

    if (args.length === 0) {
      const consoleAgent = new ConsoleAgent();
      await consoleAgent.start();
    } else {
      const [commandName, ...commandArgs] = args;
      const cliAgent = new CliAgent(args);
      await cliAgent.execute(commandName, commandArgs);
    }
  }
}
