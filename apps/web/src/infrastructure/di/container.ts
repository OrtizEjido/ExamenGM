import { GetDashboardSummary } from "@/application/dashboard/GetDashboardSummary";
import { InMemoryDashboardRepository } from "@/infrastructure/dashboard/InMemoryDashboardRepository";
import { ListProducts } from "@/application/catalog/ListProducts";
import { HttpCatalogRepository } from "@/infrastructure/catalog/HttpCatalogRepository";
import {
  ListNotifications,
  MarkNotificationRead,
} from "@/application/notifications/useCases";
import { HttpNotificationsRepository } from "@/infrastructure/notifications/HttpNotificationsRepository";

/**
 * Composition root (DI). Único lugar que conoce las implementaciones concretas
 * y las cablea con los casos de uso. Cambiar un adapter se hace solo aquí.
 */
export interface AppServices {
  getDashboardSummary: GetDashboardSummary;
  listProducts: ListProducts;
  listNotifications: ListNotifications;
  markNotificationRead: MarkNotificationRead;
}

export function createContainer(): AppServices {
  const dashboardRepository = new InMemoryDashboardRepository();
  const catalogRepository = new HttpCatalogRepository();
  const notificationsRepository = new HttpNotificationsRepository();

  return {
    getDashboardSummary: new GetDashboardSummary(dashboardRepository),
    listProducts: new ListProducts(catalogRepository),
    listNotifications: new ListNotifications(notificationsRepository),
    markNotificationRead: new MarkNotificationRead(notificationsRepository),
  };
}
