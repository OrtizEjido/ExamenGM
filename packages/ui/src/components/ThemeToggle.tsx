"use client";

import { Switch } from "antd";
import { BulbFilled, BulbOutlined } from "@ant-design/icons";

export interface ThemeToggleProps {
  /** True si el modo oscuro está activo. */
  isDark: boolean;
  onChange: (isDark: boolean) => void;
  /** Etiqueta accesible (la provee el consumidor, i18n). */
  ariaLabel?: string;
}

/**
 * Interruptor de tema claro/oscuro. Agnóstico al gestor de tema: recibe el estado
 * y notifica cambios por props; la app lo conecta con next-themes.
 */
export function ThemeToggle({ isDark, onChange, ariaLabel }: ThemeToggleProps) {
  return (
    <Switch
      checked={isDark}
      onChange={onChange}
      aria-label={ariaLabel}
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
    />
  );
}
