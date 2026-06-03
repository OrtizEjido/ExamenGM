/**
 * Capa de DOMINIO — independiente de framework, HTTP, ORM y UI.
 *
 * Modelo de lectura del resumen del dashboard. No conoce DTOs ni filas de BD;
 * los adapters de infraestructura mapean hacia este modelo.
 */
export interface DashboardSummary {
  productsCount: number;
  salesCount: number;
  refundsCount: number;
}
