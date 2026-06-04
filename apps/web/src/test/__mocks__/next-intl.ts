/**
 * Mock de next-intl para el entorno de test (jsdom).
 * `useTranslations` devuelve las claves como texto para que los tests sean legibles.
 */
import { vi } from "vitest";

export const useTranslations = vi.fn(
  (ns?: string) =>
    (key: string) =>
      ns ? `${ns}.${key}` : key,
);

export const useLocale = vi.fn(() => "es");
