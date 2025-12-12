// src/agents/telegram-agent.ts
import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters"; // ✅ Solución al error de deprecación
import fs from "fs";
import path from "path";
import { CommandDispatcher } from "../dispatcher/comand-dispatcher.js";
import { SessionManager } from "../core/sesion-manager.js";
import { LocalAuthManager } from "../core/auth.js"; // ✅ Tu sistema de auth local
import { ChatCommand } from "../commands/chat-command.js";
import { TelegramChannel } from "../channels/telegram-channel.js";
import { SorenMode } from "../core/gemini-client.js";
import { ConsolidateCommand } from "../commands/consolidate-command.js"; // <-- Importar

const TELEGRAM_MAP_PATH = path.join(process.cwd(), "data", "telegram_users.json");

export class TelegramAgent {
  private bot: Telegraf;
  private dispatcher: CommandDispatcher;
  private sessionManager: SessionManager;
  private authManager: LocalAuthManager;
  private userMap: Record<number, string> = {}; 

  constructor(token: string, sessionManager: SessionManager) { // Aceptar SessionManager
    this.bot = new Telegraf(token);
    this.dispatcher = new CommandDispatcher();
    this.sessionManager = sessionManager; 
    this.dispatcher = new CommandDispatcher(); // Pasar la sesión al dispatcher
    this.authManager = new LocalAuthManager(); 

    this.loadUserMap();
    this.registerCommands();
    this.setupListeners();
  }

  private loadUserMap() {
    if (fs.existsSync(TELEGRAM_MAP_PATH)) {
      this.userMap = JSON.parse(fs.readFileSync(TELEGRAM_MAP_PATH, "utf-8"));
    }
  }

  private saveUserMap() {
    fs.writeFileSync(TELEGRAM_MAP_PATH, JSON.stringify(this.userMap, null, 2));
  }

  private registerCommands() {
    this.dispatcher.register("chat", new ChatCommand(this.sessionManager));
    this.dispatcher.register("consolidate", new ConsolidateCommand(this.sessionManager));
  }

  private setupListeners() {
    this.bot.start((ctx) => {
      const username = this.userMap[ctx.chat.id];
      if (username) {
        ctx.reply(`🔮 Hola de nuevo, ${username}. Søren Mirror Online.`);
        this.sessionManager.startSession(username, 9999); //
      } else {
        ctx.reply(
          "🔮 Que onda, Soy Søren, de Søren Mirror.\n" +
          "⚠️ No te reconozco pibe/a, por favor, vinculá tu cuenta local con:\n\n" +
          "`/login <usuario> <password>`\n\n" +
          "o creá una cuenta local primero.\n" +
          "/auth <usuario> <password>`\n\n" +
          "Tu identidad será verificada y podrás chatear conmigo."
        );
      }
    });

    // COMANDO DE REGISTRO (AUTH)
    this.bot.command("auth", async (ctx) => {
      const parts = ctx.message.text.split(" ").slice(1);
      if (parts.length !== 2) {
        return ctx.reply("❌ Uso incorrecto. Formato: /auth <nuevo_usuario> <password>");
      }
      const [username, password] = parts;

      try {
        await this.authManager.registerUser(username, password);
        ctx.reply(`✅ ¡Usuario '${username}' creado con éxito! Ahora puedes vincular tu cuenta con:\n\n/login ${username} <password>`);
      } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
          ctx.reply(`⚠️ El usuario '${username}' ya existe. Intenta con otro nombre.`);
        } else {
          console.error("Error en /auth:", error);
          ctx.reply("🚨 Error interno al intentar registrar el usuario.");
        }
      }
    });

   // COMANDO DE LOGIN
    this.bot.command("login", async (ctx) => {
      const parts = ctx.message.text.split(" ").slice(1);
      if (parts.length !== 2) {
        return ctx.reply("❌ Uso incorrecto. Formato: /login <usuario> <password>");
      }
      const [username, password] = parts;
      const telegramId = ctx.chat.id;

      try {
        const authenticated = await this.authManager.loginUser(username, password);
        if (authenticated) {
          this.userMap[telegramId] = username;
          this.saveUserMap();
          this.sessionManager.startSession(username, 9999);
          ctx.reply(`✅ ¡Éxito! Tu cuenta de Telegram ha sido vinculada a '${username}'.`);
        } else {
          ctx.reply("❌ Usuario o contraseña incorrectos.");
        }
      } catch (error) {
        console.error("Error en /login:", error);
        ctx.reply("🚨 Error interno al intentar autenticar.");
      }
    });
    

    // COMANDOS PARA CAMBIAR DE MODO
    this.bot.command("writer", async (ctx) => {
        const username = this.userMap[ctx.chat.id];
        if (!username || !this.sessionManager.isActive()) {
            return ctx.reply("🔒 Primero inicia sesión con /login.");
        }
        await this.sessionManager.setPersona(SorenMode.WRITER);
        ctx.reply("✍️ Modo escritor activado. Tono reflexivo y sereno.");
    });

    this.bot.command("architect", async (ctx) => {
        const username = this.userMap[ctx.chat.id];
        if (!username || !this.sessionManager.isActive()) {
            return ctx.reply("🔒 Primero inicia sesión con /login.");
        }
        await this.sessionManager.setPersona(SorenMode.ARCHITECT);
        ctx.reply("🏗️ Modo arquitecto activado. Tono técnico y directo.");
    });

    this.bot.on(message("text"), async (ctx) => {
      const username = this.userMap[ctx.chat.id];
      
      if (!username) {
        return ctx.reply("🔮 Que onda, Soy Søren, de Søren Mirror.\n" +
          "⚠️ No te reconozco pibe/a, por favor, vinculá tu cuenta local con:\n\n" +
          "`/login <usuario> <password>`\n\n" +
          "o creá una cuenta local primero.\n" +
          "/auth <usuario> <password>`\n\n" +
          "Recién ahí vamos a poder hablar.");
      }

      // Asegurar que la sesión esté viva en el manager
      if (!this.sessionManager.isActive()) {
          await this.sessionManager.startSession(username, 60);
      }
      const text = ctx.message.text;
      // Ignorar comandos que empiezan con / (ya los maneja Telegraf)
      if (text.startsWith("/")) return;


      const channel = new TelegramChannel(ctx);
      // Telegram corta el "typing" a los 5s. Creamos un loop para renovarlo.
      await ctx.sendChatAction("typing"); 
      const typingLoop = setInterval(async () => {
        try {
          await ctx.sendChatAction("typing");
        } catch (e) {
        }
      }, 4000); // Cada 4 segundos

      try {
        await this.dispatcher.execute("chat", [text], channel);
      } catch (error) {
        console.error("Error:", error);
        ctx.reply("❌ Error en el núcleo.");
      } finally {
        // MUY IMPORTANTE: Matar el loop siempre, pase lo que pase
        clearInterval(typingLoop);
      }
    });
  }

  public async start() {
    console.log("🚀 Telegram Bot iniciando...");
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    await this.bot.launch();
    console.log("✅ Bot conectado. Esperando inputs...");
  }
}