"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/presentation/di/ServicesProvider";
import { sessionStore } from "@/infrastructure/auth/sessionStore";

export interface LoginViewModel {
  loading: boolean;
  error: string | null;
  submit: (username: string, password: string) => Promise<void>;
}

export function useLoginViewModel(): LoginViewModel {
  const { loginUseCase } = useServices();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await loginUseCase.execute({ username, password });
      sessionStore.save(session);
      router.push("/dashboard");
    } catch (e) {
      const status = e instanceof Error && e.message.includes("401") ? 401 : 0;
      setError(status === 401 ? "Credenciales incorrectas" : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, submit };
}
