import { GetDashboardSummary } from "@/application/dashboard/GetDashboardSummary";
import { InMemoryDashboardRepository } from "@/infrastructure/dashboard/InMemoryDashboardRepository";
import { ListProducts } from "@/application/catalog/ListProducts";
import { HttpCatalogRepository } from "@/infrastructure/catalog/HttpCatalogRepository";
import {
  ListNotifications,
  MarkNotificationRead,
} from "@/application/notifications/useCases";
import { HttpNotificationsRepository } from "@/infrastructure/notifications/HttpNotificationsRepository";
import { LoginUseCase } from "@/application/auth/LoginUseCase";
import { HttpAuthRepository } from "@/infrastructure/auth/HttpAuthRepository";

/**
 * Composition root (DI). Único lugar que conoce las implementaciones concretas
 * y las cablea con los casos de uso.
 */
export interface AppServices {
  getDashboardSummary: GetDashboardSummary;
  listProducts: ListProducts;
  listNotifications: ListNotifications;
  markNotificationRead: MarkNotificationRead;
  loginUseCase: LoginUseCase;
}

export function createContainer(): AppServices {
  return {
    getDashboardSummary: new GetDashboardSummary(new InMemoryDashboardRepository()),
    listProducts: new ListProducts(new HttpCatalogRepository()),
    listNotifications: new ListNotifications(new HttpNotificationsRepository()),
    markNotificationRead: new MarkNotificationRead(new HttpNotificationsRepository()),
    loginUseCase: new LoginUseCase(new HttpAuthRepository()),
  };
}
