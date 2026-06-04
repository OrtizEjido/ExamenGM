import { prisma } from "../prisma/client";
import { PrismaProductRepository } from "../catalog/PrismaProductRepository";
import { PrismaNotificationRepository } from "../notifications/PrismaNotificationRepository";
import { PrismaAuthRepository } from "../auth/PrismaAuthRepository";
import {
  CreateProduct,
  DeleteProduct,
  GetProduct,
  ListProducts,
  SearchProductsByName,
  SearchProductsBySku,
} from "../../application/catalog/useCases";
import {
  CreateNotification,
  DeleteNotification,
  ListNotifications,
  MarkNotificationRead,
} from "../../application/notifications/useCases";
import { Login } from "../../application/auth/Login";
import type { LoginInput, LoginResult } from "../../application/auth/Login";
import type { Product } from "../../domain/catalog/Product";
import type {
  CreateProductData,
  PageParams,
  PageResult,
} from "../../application/catalog/ProductRepository";
import type { Notification } from "../../domain/notifications/Notification";
import type { CreateNotificationData } from "../../application/notifications/NotificationRepository";

export interface AppServices {
  login: { execute(input: LoginInput): Promise<LoginResult | null> };
  listProducts: { execute(params: PageParams): Promise<PageResult<Product>> };
  getProduct: { execute(id: number): Promise<Product | null> };
  searchProductsByName: { execute(query: string, params: PageParams): Promise<PageResult<Product>> };
  searchProductsBySku: { execute(query: string, params: PageParams): Promise<PageResult<Product>> };
  createProduct: { execute(input: CreateProductData): Promise<Product> };
  deleteProduct: { execute(id: number): Promise<void> };
  listNotifications: { execute(userId: number): Promise<Notification[]> };
  markNotificationRead: { execute(id: number): Promise<Notification | null> };
  createNotification: { execute(input: CreateNotificationData): Promise<Notification> };
  deleteNotification: { execute(id: number): Promise<void> };
}

export function createContainer(): AppServices {
  const authRepository = new PrismaAuthRepository(prisma);
  const productRepository = new PrismaProductRepository(prisma);
  const notificationRepository = new PrismaNotificationRepository(prisma);

  return {
    login: new Login(authRepository),
    listProducts: new ListProducts(productRepository),
    getProduct: new GetProduct(productRepository),
    searchProductsByName: new SearchProductsByName(productRepository),
    searchProductsBySku: new SearchProductsBySku(productRepository),
    createProduct: new CreateProduct(productRepository),
    deleteProduct: new DeleteProduct(productRepository),
    listNotifications: new ListNotifications(notificationRepository),
    markNotificationRead: new MarkNotificationRead(notificationRepository),
    createNotification: new CreateNotification(notificationRepository),
    deleteNotification: new DeleteNotification(notificationRepository),
  };
}
