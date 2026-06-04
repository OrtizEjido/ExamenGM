/**
 * Helpers de normalización reutilizados por el ETL del seed y sus tests.
 * Exportados para poder testearlos sin importar el seed completo (que tiene side-effects).
 */

export const VALID_KINDS = ["info", "warn", "alert", "system", "marketing"];

/** Fechas ISO simples (productos): 'YYYY-MM-DD'. */
export function parseIsoDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fechas legacy mezcladas: ISO, 'DD/MM/YYYY' o epoch unix (segundos). */
export function parseMixedDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const s = String(value).trim();
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return new Date(n < 1e12 ? n * 1000 : n);
  }
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00.000Z`);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Estatus legacy → booleano leído (read/READ/leido = true; unread = false). */
export function isRead(legacy: unknown): boolean {
  return String(legacy ?? "").toLowerCase() !== "unread";
}

export function normalizeKind(legacy: unknown): string {
  const k = String(legacy ?? "").toLowerCase();
  return VALID_KINDS.includes(k) ? k : "info";
}
