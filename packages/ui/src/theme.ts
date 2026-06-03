import type { ThemeConfig } from "antd";

/**
 * Tema base compartido (tokens). El modo claro/oscuro NO se fija aquí: lo aplica
 * `UiProvider` eligiendo el algoritmo de Ant Design (`defaultAlgorithm` /
 * `darkAlgorithm`). Por eso evitamos colores de fondo fijos: que los resuelva el
 * algoritmo para que ambos modos se vean bien.
 */
export const erpTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1f6feb",
    borderRadius: 8,
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
};
