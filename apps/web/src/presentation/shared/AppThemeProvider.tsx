"use client";

import type { ReactNode } from "react";
import { useTheme } from "next-themes";
import { UiProvider } from "@erp/ui";

/**
 * Puente entre next-themes (gestiona el modo: persistencia, sistema, sin flash) y
 * `UiProvider` de `@erp/ui` (aplica el algoritmo claro/oscuro de Ant Design).
 * Antes de montar, `resolvedTheme` es undefined → cae a "light".
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  return <UiProvider mode={mode}>{children}</UiProvider>;
}
