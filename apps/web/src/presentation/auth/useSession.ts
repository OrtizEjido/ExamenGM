"use client";

import { useEffect, useState } from "react";
import { sessionStore } from "@/infrastructure/auth/sessionStore";
import type { Session } from "@/domain/auth/Session";

/**
 * Devuelve la sesión activa desde localStorage.
 * Se inicializa a null (SSR-safe) y se hidrata en el primer render del cliente.
 */
export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(sessionStore.get());
  }, []);

  return session;
}
