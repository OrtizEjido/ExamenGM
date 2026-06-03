import type { ReactNode } from "react";
import { ServicesProvider } from "@/presentation/di/ServicesProvider";
import { AppFrame } from "@/presentation/shared/AppFrame";

// Grupo de rutas (app): todo lo que vive aquí se muestra dentro del shell con
// sidebar e inyecta el contenedor de servicios (DI).
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <ServicesProvider>
      <AppFrame>{children}</AppFrame>
    </ServicesProvider>
  );
}
