import type { DashboardRepository } from "@/application/dashboard/DashboardRepository";
import type { DashboardSummary } from "@/domain/dashboard/DashboardSummary";

/**
 * Capa de INFRAESTRUCTURA — Adapter.
 *
 * Implementación del puerto `DashboardRepository`. Devuelve los conteos del seed
 * legacy. Se reemplazará por `HttpDashboardRepository` (contra `apps/api`) sin
 * tocar el caso de uso ni la presentación (OCP).
 */
export class InMemoryDashboardRepository implements DashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    return { productsCount: 500, salesCount: 50, refundsCount: 10 };
  }
}
