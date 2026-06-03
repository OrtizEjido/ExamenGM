import type { DashboardSummary } from "@/domain/dashboard/DashboardSummary";

/**
 * Capa de APLICACIÓN — Puerto (abstracción).
 *
 * Interfaz pequeña y enfocada (ISP). Los casos de uso dependen de esta
 * abstracción, no de implementaciones concretas (DIP). La infraestructura la
 * implementa (in-memory hoy, HTTP contra `apps/api` después).
 */
export interface DashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}
