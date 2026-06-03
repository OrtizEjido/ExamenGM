import { GetDashboardSummary } from "@/application/dashboard/GetDashboardSummary";
import { InMemoryDashboardRepository } from "@/infrastructure/dashboard/InMemoryDashboardRepository";
import { ListProducts } from "@/application/catalog/ListProducts";
import { HttpCatalogRepository } from "@/infrastructure/catalog/HttpCatalogRepository";

/**
 * Composition root (DI). Único lugar que conoce las implementaciones concretas
 * y las cablea con los casos de uso. Cambiar un adapter se hace solo aquí.
 */
export interface AppServices {
  getDashboardSummary: GetDashboardSummary;
  listProducts: ListProducts;
}

export function createContainer(): AppServices {
  const dashboardRepository = new InMemoryDashboardRepository();
  const catalogRepository = new HttpCatalogRepository();

  return {
    getDashboardSummary: new GetDashboardSummary(dashboardRepository),
    listProducts: new ListProducts(catalogRepository),
  };
}
