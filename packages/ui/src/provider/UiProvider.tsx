"use client";

import type { ComponentProps, ReactNode } from "react";
import { ConfigProvider, App as AntApp, theme as antdTheme } from "antd";
import esES from "antd/locale/es_ES";
import { erpTheme } from "../theme";

type AntdLocale = ComponentProps<typeof ConfigProvider>["locale"];

export type ThemeMode = "light" | "dark";

export interface UiProviderProps {
  children: ReactNode;
  /**
   * Locale de Ant Design (textos internos de componentes: OK/Cancel, paginación,
   * date pickers, etc.). Default: es-ES. La app lo cambia según el idioma activo.
   */
  locale?: AntdLocale;
  /** Modo de color. Default: "light". La app lo conecta con next-themes. */
  mode?: ThemeMode;
}

/**
 * Provee tema (claro/oscuro vía algoritmo de Ant Design), locale y el contexto de
 * `App` (necesario para `message`, `notification` y `Modal` estáticos).
 */
export function UiProvider({
  children,
  locale = esES,
  mode = "light",
}: UiProviderProps) {
  return (
    <ConfigProvider
      locale={locale}
      theme={{
        ...erpTheme,
        algorithm:
          mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
