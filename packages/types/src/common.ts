/**
 * Escalares compartidos.
 *
 * Reflejan el legacy **1:1**. Los alias documentan inconsistencias conocidas que se
 * normalizarán en una fase posterior; por ahora se migran tal cual existen en la BD.
 */

/** PK entera autoincremental de SQLite. */
export type Id = number;

/**
 * LEGACY: montos guardados como TEXT en la BD
 * (p.ej. `sales.total = '8070.06'`, `refunds.amount = '3335.5'`).
 * Se migra como `string`; normalizar a numérico/decimal después.
 */
export type MoneyString = string;

/**
 * LEGACY: fechas en formatos mezclados dentro de la misma columna:
 *  - ISO `'YYYY-MM-DD'`
 *  - `'DD/MM/YYYY'`
 *  - epoch unix como string `'1735862400'`
 * Se migra como `string`; normalizar a ISO/`Date` después.
 */
export type LegacyDateString = string;

/** LEGACY: booleano almacenado como entero `0 | 1` (p.ej. `users.is_admin`). */
export type IntBool = 0 | 1;

/** Respuesta de error genérica usada por múltiples endpoints. */
export interface ErrorResponse {
  error: string;
}

/**
 * LEGACY (inseguro): autorización resuelta con un payload enviado por el cliente.
 * `require_admin(data)` en el legacy solo lee `data['is_admin']`. Se modela para
 * mantener el contrato 1:1; se reemplazará por auth real en una fase posterior.
 */
export interface AdminAuthPayload {
  is_admin?: boolean;
  user_id?: Id;
}
