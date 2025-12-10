// src/core/local-auth.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

export class LocalAuthManager {
  private authFilePath: string;

  constructor() {
    this.authFilePath = path.join(os.homedir(), ".soren_auth");
    this.ensureAuthFileExists();
  }

  private ensureAuthFileExists(): void {
    if (!fs.existsSync(this.authFilePath)) {
      fs.writeFileSync(this.authFilePath, "", { mode: 0o600 }); // Solo usuario puede leer/escribir
    }
  }

  private hashPassword(password: string): string {
    return crypto
      .pbkdf2Sync(password, "soren_salt_12345", 100000, 64, "sha512")
      .toString("hex");
  }

  /**
   * Registrar nuevo usuario localmente
   */
  async registerUser(username: string, password: string): Promise<boolean> {
    try {
      // Leer usuarios existentes
      const content = fs.readFileSync(this.authFilePath, "utf-8");
      const users = content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.split(" ")[0]);

      if (users.includes(username)) {
        return false; // Usuario ya existe
      }

      // Hashear y guardar
      const hashedPassword = this.hashPassword(password);
      const newLine = `${username} ${hashedPassword}\n`;
      fs.appendFileSync(this.authFilePath, newLine, { mode: 0o600 });
      return true;
    } catch (error) {
      console.error("Error registrando usuario:", error);
      return false;
    }
  }

  /**
   * Autenticar usuario
   */
  async loginUser(username: string, password: string): Promise<boolean> {
    try {
      const content = fs.readFileSync(this.authFilePath, "utf-8");
      const hashedPassword = this.hashPassword(password);

      const found = content
        .split("\n")
        .filter((line) => line.trim())
        .find((line) => {
          const [user, stored] = line.split(" ");
          return user === username && stored === hashedPassword;
        });

      return !!found;
    } catch (error) {
      console.error("Error autenticando:", error);
      return false;
    }
  }

  /**
   * Obtener todos los usuarios registrados
   */
  getRegisteredUsers(): string[] {
    try {
      const content = fs.readFileSync(this.authFilePath, "utf-8");
      return content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.split(" ")[0]);
    } catch {
      return [];
    }
  }
}
