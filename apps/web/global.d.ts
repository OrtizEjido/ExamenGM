// Tipado de los mensajes i18n: habilita autocompletado y verificación de claves
// en `useTranslations` / `getTranslations`. La fuente de verdad de las claves es
// el catálogo en español; `en.json` debe mantener la misma forma.
import type esMessages from "./messages/es.json";

type Messages = typeof esMessages;

declare global {
  interface IntlMessages extends Messages {}
}
