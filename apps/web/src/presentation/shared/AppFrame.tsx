"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  DashboardOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  RollbackOutlined,
  BarChartOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { AppLayout, Sidebar, ThemeToggle } from "@erp/ui";
import type { SidebarItem } from "@erp/ui";

// Estructura de navegación (sin textos: las etiquetas vienen de i18n por su key).
const ROUTES = [
  { key: "dashboard", href: "/dashboard" },
  { key: "catalog", href: "/catalog" },
  { key: "inventory", href: "/inventory" },
  { key: "sales", href: "/sales" },
  { key: "purchases", href: "/purchases" },
  { key: "refunds", href: "/refunds" },
  { key: "reports", href: "/reports" },
  { key: "notifications", href: "/notifications" },
] as const;

const ICONS: Record<(typeof ROUTES)[number]["key"], ReactNode> = {
  dashboard: <DashboardOutlined />,
  catalog: <AppstoreOutlined />,
  inventory: <InboxOutlined />,
  sales: <ShoppingCartOutlined />,
  purchases: <ShoppingOutlined />,
  refunds: <RollbackOutlined />,
  reports: <BarChartOutlined />,
  notifications: <BellOutlined />,
};

export function AppFrame({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const tNav = useTranslations("nav");
  const tApp = useTranslations("app");
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const items: SidebarItem[] = ROUTES.map((r) => ({
    key: r.key,
    href: r.href,
    label: tNav(r.key),
    icon: ICONS[r.key],
  }));

  const seg = `/${pathname.split("/")[1]}`;
  const active = items.find((n) => n.href === seg) ?? items[0];

  return (
    <AppLayout
      headerTitle={active?.label}
      headerExtra={
        <ThemeToggle
          isDark={isDark}
          onChange={(dark) => setTheme(dark ? "dark" : "light")}
          ariaLabel={tApp("themeToggle")}
        />
      }
      sidebar={
        <Sidebar
          items={items}
          activeKey={active?.key}
          title={tApp("name")}
          collapsedTitle={tApp("shortName")}
          ariaLabel={tApp("ariaLabel")}
          theme="dark"
          onNavigate={(href) => router.push(href)}
        />
      }
    >
      {children}
    </AppLayout>
  );
}
