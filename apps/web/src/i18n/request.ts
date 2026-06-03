import { getRequestConfig } from "next-intl/server";

/**
 * Capa de idioma (next-intl, sin routing de locale).
 *
 * Hoy el locale es fijo en español. Para habilitar inglés en el futuro basta con
 * resolver aquí el locale (cookie, header `Accept-Language` o preferencia de
 * usuario) — los mensajes en inglés ya existen en `messages/en.json`.
 */
export const SUPPORTED_LOCALES = ["es", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "es";

export default getRequestConfig(async () => {
  const locale: AppLocale = DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
