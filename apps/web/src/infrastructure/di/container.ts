import { GetDashboardSummary } from "@/application/dashboard/GetDashboardSummary";
import { InMemoryDashboardRepository } from "@/infrastructure/dashboard/InMemoryDashboardRepository";
import { ListProducts, SearchProductsByName, SearchProductsBySku } from "@/application/catalog/ListProducts";
import { HttpCatalogRepository } from "@/infrastructure/catalog/HttpCatalogRepository";
import { ListNotifications, MarkNotificationRead } from "@/application/notifications/useCases";
import { HttpNotificationsRepository } from "@/infrastructure/notifications/HttpNotificationsRepository";
import { LoginUseCase } from "@/application/auth/LoginUseCase";
import { HttpAuthRepository } from "@/infrastructure/auth/HttpAuthRepository";
import { ListInventory, ListInventoryByWarehouse, SearchInventoryByProductName, ListWarehouses } from "@/application/inventory/useCases";
import { HttpInventoryRepository } from "@/infrastructure/inventory/HttpInventoryRepository";
import { ListRefunds, ListRefundsByStatus } from "@/application/refunds/useCases";
import { HttpRefundRepository } from "@/infrastructure/refunds/HttpRefundRepository";

export interface AppServices {
  getDashboardSummary: GetDashboardSummary;
  listProducts: ListProducts;
  searchProductsByName: SearchProductsByName;
  searchProductsBySku: SearchProductsBySku;
  listNotifications: ListNotifications;
  markNotificationRead: MarkNotificationRead;
  loginUseCase: LoginUseCase;
  listInventory: ListInventory;
  listInventoryByWarehouse: ListInventoryByWarehouse;
  searchInventoryByProductName: SearchInventoryByProductName;
  listWarehouses: ListWarehouses;
  listRefunds: ListRefunds;
  listRefundsByStatus: ListRefundsByStatus;
}

export function createContainer(): AppServices {
  const catalogRepo = new HttpCatalogRepository();
  const inventoryRepo = new HttpInventoryRepository();
  const refundRepo = new HttpRefundRepository();
  return {
    getDashboardSummary: new GetDashboardSummary(new InMemoryDashboardRepository()),
    listProducts: new ListProducts(catalogRepo),
    searchProductsByName: new SearchProductsByName(catalogRepo),
    searchProductsBySku: new SearchProductsBySku(catalogRepo),
    listNotifications: new ListNotifications(new HttpNotificationsRepository()),
    markNotificationRead: new MarkNotificationRead(new HttpNotificationsRepository()),
    loginUseCase: new LoginUseCase(new HttpAuthRepository()),
    listInventory: new ListInventory(inventoryRepo),
    listInventoryByWarehouse: new ListInventoryByWarehouse(inventoryRepo),
    searchInventoryByProductName: new SearchInventoryByProductName(inventoryRepo),
    listWarehouses: new ListWarehouses(inventoryRepo),
    listRefunds: new ListRefunds(refundRepo),
    listRefundsByStatus: new ListRefundsByStatus(refundRepo),
  };
}
