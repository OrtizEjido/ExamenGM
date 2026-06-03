import type { DashboardRepository } from "./DashboardRepository";
import type { DashboardSummary } from "@/domain/dashboard/DashboardSummary";

/**
 * Capa de APLICACIÓN — Caso de uso.
 *
 * Una sola responsabilidad (SRP): obtener el resumen del dashboard.
 * Recibe el puerto por inyección de constructor (DIP); es sustituible y testeable.
 */
export class GetDashboardSummary {
  constructor(private readonly repository: DashboardRepository) {}

  execute(): Promise<DashboardSummary> {
    return this.repository.getSummary();
  }
}
