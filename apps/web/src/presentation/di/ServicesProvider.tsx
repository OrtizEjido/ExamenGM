"use client";

import { createContext, useContext, useRef } from "react";
import type { ReactNode } from "react";
import { createContainer } from "@/infrastructure/di/container";
import type { AppServices } from "@/infrastructure/di/container";

const ServicesContext = createContext<AppServices | null>(null);

/**
 * Inyecta el contenedor de servicios (casos de uso) en el árbol de React.
 * Los ViewModels lo consumen vía `useServices()`; nunca instancian adapters.
 */
export function ServicesProvider({ children }: { children: ReactNode }) {
  const ref = useRef<AppServices | null>(null);
  if (ref.current === null) {
    ref.current = createContainer();
  }
  return (
    <ServicesContext.Provider value={ref.current}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (services === null) {
    throw new Error("useServices debe usarse dentro de <ServicesProvider>");
  }
  return services;
}
