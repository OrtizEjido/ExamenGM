import { prisma } from "../prisma/client";
import { PrismaProductRepository } from "../catalog/PrismaProductRepository";
import { PrismaNotificationRepository } from "../notifications/PrismaNotificationRepository";
import {
  CreateProduct,
  DeleteProduct,
  GetProduct,
  ListProducts,
  SearchProducts,
} from "../../application/catalog/useCases";
import {
  CreateNotification,
  DeleteNotification,
  ListNotifications,
  MarkNotificationRead,
} from "../../application/notifications/useCases";

/** Composition root: cablea adapters concretos con los casos de uso. */
export interface AppServices {
  listProducts: ListProducts;
  getProduct: GetProduct;
  searchProducts: SearchProducts;
  createProduct: CreateProduct;
  deleteProduct: DeleteProduct;
  listNotifications: ListNotifications;
  markNotificationRead: MarkNotificationRead;
  createNotification: CreateNotification;
  deleteNotification: DeleteNotification;
}

export function createContainer(): AppServices {
  const productRepository = new PrismaProductRepository(prisma);
  const notificationRepository = new PrismaNotificationRepository(prisma);

  return {
    listProducts: new ListProducts(productRepository),
    getProduct: new GetProduct(productRepository),
    searchProducts: new SearchProducts(productRepository),
    createProduct: new CreateProduct(productRepository),
    deleteProduct: new DeleteProduct(productRepository),
    listNotifications: new ListNotifications(notificationRepository),
    markNotificationRead: new MarkNotificationRead(notificationRepository),
    createNotification: new CreateNotification(notificationRepository),
    deleteNotification: new DeleteNotification(notificationRepository),
  };
}
