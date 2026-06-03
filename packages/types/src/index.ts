/**
 * @erp/types — contratos compartidos entre `apps/api` y `apps/web`.
 *
 * Tipado migrado **1:1** desde Legacy Nexus (Flask + SQLite). Las inconsistencias
 * de datos conocidas se documentan en `common.ts` y en cada contexto; su
 * normalización es una fase posterior.
 */
export * from "./common";
export * from "./identity";
export * from "./catalog";
export * from "./inventory";
export * from "./sales";
export * from "./purchasing";
export * from "./notifications";
export * from "./refunds";
export * from "./reporting";
