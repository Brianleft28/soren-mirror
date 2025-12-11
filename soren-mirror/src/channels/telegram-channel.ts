// src/channels/telegram-channel.ts
import { IChannel } from "./IChanel.js";
import { Context } from "telegraf";

export class TelegramChannel implements IChannel {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  /**
   * Devuelve el tipo de canal.
   */
  getType(): "telegram" {
    return "telegram";
  }

  /**
   * Envia el mensaje de vuelta a Telegram.
   * Detecta si es Markdown para formatearlo correctamente.
   */
  async send(message: string): Promise<void> {
    try {
      // Intentamos enviar con formato Markdown primero si detectamos sintaxis
      if (message.includes("**") || message.includes("`")) {
        await this.ctx.replyWithMarkdownV2(message);
      } else {
        await this.ctx.reply(message);
      }
    } catch (error) {
      // Fallback a texto plano si falla el markdown (común con caracteres especiales)
      console.error("Error enviando MD a Telegram, enviando plano:", error);
      await this.ctx.reply(message);
    }
  }

  /**
   * Telegram es Push, no Pull. No deberíamos llamar a read() desde la lógica síncrona.
   */

  async read(): Promise<string> {
    throw new Error("TelegramChannel es reactivo (push), no soporta lectura síncrona (read).");
  }

  /**
   * Método extra para UX (Søren escribiendo...)
   */
  async showTyping(): Promise<void> {
    await this.ctx.sendChatAction("typing");
  }
}