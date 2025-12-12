// src/channels/telegram-channel.ts
import { ca } from "date-fns/locale";
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
      // 🛠️ TRADUCTOR GEMINI -> TELEGRAM LEGACY
      let cleanMessage = message;
      // Convertir listas con asterisco (* Item) a guiones (- Item)
      // Telegram confunde "* " con inicio de negrita sin cerrar.
      cleanMessage = cleanMessage.replace(/^ \* /gm, "- ");
      cleanMessage = cleanMessage.replace(/^\* /gm, "- ");
      // Convertir Negrita estándar (**Texto**) a Legacy (*Texto*)
      cleanMessage = cleanMessage.replace(/\*\*/g, "*");
      // Convertir Negrita alternativa (__Texto__) a Legacy (*Texto*)
      cleanMessage = cleanMessage.replace(/__/g, "*");
      // Intentamos enviar con Legacy Markdown
      // Es menos estricto que V2, solo pide cerrar las * y _
      await this.ctx.reply(cleanMessage, { parse_mode: "Markdown" });
    } catch (error) {
      console.warn("⚠️ Falló Markdown. Reintentando en plano.");
      // Fallback: Si falla (ej: un * sin cerrar), mandamos plano para no perder el mensaje
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