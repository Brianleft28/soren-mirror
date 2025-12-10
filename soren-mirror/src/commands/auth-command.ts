// src/commands/AuthCommand.ts

import { IChannel } from "../channels/IChanel.js";
import { LocalAuthManager } from "../core/auth.js";
import { SorenCommand } from "../dispatcher/soren-command.js";
import { SessionManager } from "../core/sesion-manager.js";
import { SorenMode } from "../core/ollama-client.js";

/**
 * Utilidad simple para parsear flags:
 * --persona architect | writer | public
 * --persona=writer
 */

function parsePersonaFromFlags(args: string[]): SorenMode | undefined {
  for (const a of args) {
    if (a.startsWith("--persona=")) {
      const val = a.split("=")[1];
      return toSorenMode(val);
    }
  }
  const idx = args.indexOf("--persona");
  if (idx >= 0 && idx + 1 < args.length) {
    return toSorenMode(args[idx + 1]);
  }
  return undefined;
}

function toSorenMode(val?: string): SorenMode | undefined {
  if (!val) return undefined;
  const v = val.toLowerCase();
  switch (v) {
    case "architect":
    case "architect_persona":
    case "architect_persona.md":
    case "architect_persona":
      return SorenMode.ARCHITECT;
    case "writer":
    case "private":
    case "private_persona":
      return SorenMode.WRITER;
    case "public":
    case "portfolio":
      return SorenMode.PUBLIC;
    case "raw":
      return SorenMode.RAW;
    default:
      return undefined;
  }
}

export class AuthCommand extends SorenCommand {
  name = "auth";
  description =
    "Autenticarse o registrar (auth <login|register> <username> <password> [--persona <architect|writer|public>])";
  parameters = ["action", "username", "password"];

  private authManager = new LocalAuthManager();
  private sessionManager?: SessionManager;

  constructor(sessionManager?: SessionManager) {
    super();
    this.sessionManager = sessionManager;
  }

  async execute(args: string[], channel: IChannel): Promise<void> {
    try {
      // parse optional persona flags, but keep main parameters
      const personaFromFlags = parsePersonaFromFlags(args);

      // remove flags for main positional parsing
      const cleanedArgs = args.filter((a) => !a.startsWith("--persona"));
      // also remove the value that follows --persona
      const reducedArgs: string[] = [];
      for (let i = 0; i < cleanedArgs.length; i++) {
        if (cleanedArgs[i] === "--persona") {
          i++; // skip the next arg (it's the persona value)
          continue;
        }
        reducedArgs.push(cleanedArgs[i]);
      }

      const [action, username, password] = reducedArgs;

      if (!action || !username || !password) {
        await channel.send(
          `❌ Uso: auth <login|register> <username> <password> [--persona <architect|writer|public>]`
        );
        return;
      }

     if (action === "login") {
       const isValid = await this.authManager.loginUser(username, password);
       if (isValid) {
         if (this.sessionManager) {
           // Si hay persona por flags, úsala; sino, intenta leerla desde la sesión (await)
           let personaValue: SorenMode | undefined = personaFromFlags;
           if (!personaValue && this.sessionManager.getPersona) {
             personaValue = await this.sessionManager.getPersona();
           }
           const personaToUse: SorenMode = personaValue ?? SorenMode.ARCHITECT;

           // Si se proporciona modelFromFlags antes, podrías guardarlo también (opcional)
           await this.sessionManager.startSession(username, 60, personaToUse);
           await this.sessionManager.setPersona(personaToUse);
         }

         await channel.send(`✅ Bienvenido, ${username}`);
       } else {
         await channel.send(`❌ Credenciales inválidas`);
       }
     } else if (action === "register") {
       const success = await this.authManager.registerUser(username, password);
       if (success) {
         // Si el usuario se registra y hay SessionManager, podemos iniciar sesión y setear persona opcional:
         if (this.sessionManager) {
           const persona = personaFromFlags ?? SorenMode.ARCHITECT;
           await this.sessionManager.startSession(username, 60, persona);
           this.sessionManager.setPersona?.(persona);
         }
         await channel.send(`✅ Usuario '${username}' registrado`);
       } else {
         await channel.send(`❌ El usuario ya existe o hubo un error`);
       }
     } else {
       await channel.send(`❌ Acción desconocida. Usa 'login' o 'register'`);
     }
    } catch (error) {
      await this.handleError(error as Error, channel);
    }
  }
}
