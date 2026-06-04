import { GetDashboardSummary } from "@/application/dashboard/GetDashboardSummary";
import { InMemoryDashboardRepository } from "@/infrastructure/dashboard/InMemoryDashboardRepository";
import {
  ListProducts,
  SearchProductsByName,
  SearchProductsBySku,
} from "@/application/catalog/ListProducts";
import { HttpCatalogRepository } from "@/infrastructure/catalog/HttpCatalogRepository";
import {
  ListNotifications,
  MarkNotificationRead,
} from "@/application/notifications/useCases";
import { HttpNotificationsRepository } from "@/infrastructure/notifications/HttpNotificationsRepository";
import { LoginUseCase } from "@/application/auth/LoginUseCase";
import { HttpAuthRepository } from "@/infrastructure/auth/HttpAuthRepository";

export interface AppServices {
  getDashboardSummary: GetDashboardSummary;
  listProducts: ListProducts;
  searchProductsByName: SearchProductsByName;
  searchProductsBySku: SearchProductsBySku;
  listNotifications: ListNotifications;
  markNotificationRead: MarkNotificationRead;
  loginUseCase: LoginUseCase;
}

export function createContainer(): AppServices {
  const catalogRepository = new HttpCatalogRepository();
  return {
    getDashboardSummary: new GetDashboardSummary(new InMemoryDashboardRepository()),
    listProducts: new ListProducts(catalogRepository),
    searchProductsByName: new SearchProductsByName(catalogRepository),
    searchProductsBySku: new SearchProductsBySku(catalogRepository),
    listNotifications: new ListNotifications(new HttpNotificationsRepository()),
    markNotificationRead: new MarkNotificationRead(new HttpNotificationsRepository()),
    loginUseCase: new LoginUseCase(new HttpAuthRepository()),
  };
}
