/**
 * @erp/ui — componentes visuales compartidos (Ant Design).
 *
 * Consumidos por `apps/web` (Next.js). Todos los componentes interactivos son
 * client components ("use client"); Next debe transpilar este paquete
 * (`transpilePackages: ["@erp/ui"]`).
 */
export { UiProvider } from "./provider/UiProvider";
export type { UiProviderProps, ThemeMode } from "./provider/UiProvider";

export { SaveButton } from "./components/SaveButton";
export type { SaveButtonProps } from "./components/SaveButton";

export { WarningDialog } from "./components/WarningDialog";
export type { WarningDialogProps } from "./components/WarningDialog";

export { Sidebar } from "./components/Sidebar";
export type { SidebarProps, SidebarItem } from "./components/Sidebar";

export { AppLayout } from "./components/AppLayout";
export type { AppLayoutProps } from "./components/AppLayout";

export { ThemeToggle } from "./components/ThemeToggle";
export type { ThemeToggleProps } from "./components/ThemeToggle";

export { erpTheme } from "./theme";
