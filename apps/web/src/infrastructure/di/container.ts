import { GetDashboardSummary } from "@/application/dashboard/GetDashboardSummary";
import { InMemoryDashboardRepository } from "@/infrastructure/dashboard/InMemoryDashboardRepository";

/**
 * Composition root (DI). Único lugar que conoce las implementaciones concretas
 * y las cablea con los casos de uso. Cambiar un adapter (in-memory -> HTTP) se
 * hace solo aquí.
 */
export interface AppServices {
  getDashboardSummary: GetDashboardSummary;
}

export function createContainer(): AppServices {
  const dashboardRepository = new InMemoryDashboardRepository();

  return {
    getDashboardSummary: new GetDashboardSummary(dashboardRepository),
  };
}
