
export interface IChannel {
  send(message: string): Promise<void>;
  read(): Promise<string>;
  getType(): "console" | "telegram" | "web";
}
