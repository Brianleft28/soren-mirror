import fs from "fs/promises";
import path from "path";
import { SorenMode } from "./ollama-client.js";

export interface SessionData {
  username: string;
  loginTime: Date;
  sessionDurationMinutes: number;
  isActive: boolean;
  persona?: SorenMode;
}

export class SessionManager {
  private session: SessionData | null = null;
  private sessionDir = path.join(process.cwd(), "data", "sessions");

  async startSession(
    username: string,
    durationMinutes: number = 60,
    initialPersona: SorenMode = SorenMode.ARCHITECT
  ): Promise<void> {
    this.session = {
      username,
      loginTime: new Date(),
      sessionDurationMinutes: durationMinutes,
      isActive: true,
      persona: initialPersona,
    };
    // Guardar sesión en disco
    await this.saveSession();
  }

  async setPersona(persona: SorenMode): Promise<void> {
    if (!this.session) return;
    this.session.persona = persona;
    await this.saveSession();
  }

  async getPersona(): Promise<SorenMode | undefined> {
    return this.session?.persona;
  }

  private async saveSession(): Promise<void> {
    if (!this.session) return;

    await fs.mkdir(this.sessionDir, { recursive: true });
    const sessionFile = path.join(
      this.sessionDir,
      `${this.session.username}.json`
    );
    await fs.writeFile(sessionFile, JSON.stringify(this.session, null, 2));
  }

  getSessionInfo(): string {
    if (!this.session) return "❌ No hay sesión activa";

    const elapsed = Date.now() - this.session.loginTime.getTime();
    const minutes = Math.floor(elapsed / 60000);

    return `✅ Sesión activa: ${this.session.username} (${minutes}m / ${this.session.sessionDurationMinutes}m)`;
  }

  isActive(): boolean {
    return this.session?.isActive ?? false;
  }

  getCurrentUser(): string | null {
    return this.session?.username ?? null;
  }
}
