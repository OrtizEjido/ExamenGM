/**
 * Almacenamiento de sesión en localStorage.
 * Solo se ejecuta en el cliente (guard de SSR incluido).
 */

import type { Session } from "@/domain/auth/Session";

const KEY = "erp_session";

export const sessionStore = {
  save(session: Session): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(session));
  },

  get(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEY);
  },
};
