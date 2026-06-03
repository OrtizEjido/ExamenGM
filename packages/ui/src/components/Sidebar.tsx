"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Layout, Menu } from "antd";
import type { ThemeMode } from "../provider/UiProvider";

const { Sider } = Layout;

export interface SidebarItem {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface SidebarProps {
  items: SidebarItem[];
  /** Clave del ítem activo (resaltado). */
  activeKey?: string;
  /** Marca visible expandido (la provee el consumidor, i18n). */
  title?: ReactNode;
  /** Marca visible colapsado. */
  collapsedTitle?: ReactNode;
  /** Etiqueta accesible de la marca. */
  ariaLabel?: string;
  /** Modo de color del sidebar; lo provee la app según el tema activo. Default: "dark". */
  theme?: ThemeMode;
  /**
   * Callback de navegación. La UI es agnóstica al router: la app inyecta aquí
   * `router.push` de Next.js. Mantiene `@erp/ui` libre de dependencias de Next.
   */
  onNavigate?: (href: string, key: string) => void;
}

/** Barra de navegación lateral colapsable (Ant Design `Layout.Sider` + `Menu`). */
export function Sidebar({
  items,
  activeKey,
  title,
  collapsedTitle,
  ariaLabel,
  theme = "dark",
  onNavigate,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // El color de la marca debe contrastar con el fondo del Sider según el modo.
  const brandColor = theme === "dark" ? "#ffffff" : "rgba(0, 0, 0, 0.88)";

  const menuItems = items.map((it) => ({
    key: it.key,
    icon: it.icon,
    label: it.label,
  }));

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={220}
      theme={theme}
    >
      <div
        aria-label={ariaLabel}
        style={{
          height: 56,
          margin: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: brandColor,
          fontWeight: 700,
          fontSize: collapsed ? 14 : 18,
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
        }}
      >
        {collapsed ? collapsedTitle : title}
      </div>
      <Menu
        theme={theme}
        mode="inline"
        selectedKeys={activeKey ? [activeKey] : []}
        items={menuItems}
        onClick={({ key }) => {
          const target = items.find((i) => i.key === key);
          if (target) onNavigate?.(target.href, target.key);
        }}
      />
    </Sider>
  );
}
