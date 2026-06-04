import { prisma } from "../prisma/client";
import { PrismaProductRepository } from "../catalog/PrismaProductRepository";
import { PrismaNotificationRepository } from "../notifications/PrismaNotificationRepository";
import { PrismaAuthRepository } from "../auth/PrismaAuthRepository";
import { PrismaInventoryRepository } from "../inventory/PrismaInventoryRepository";
import { PrismaRefundRepository } from "../refunds/PrismaRefundRepository";
import {
  CreateProduct, DeleteProduct, GetProduct,
  ListProducts, SearchProductsByName, SearchProductsBySku,
} from "../../application/catalog/useCases";
import {
  CreateNotification, DeleteNotification,
  ListNotifications, MarkNotificationRead,
} from "../../application/notifications/useCases";
import {
  ListInventory, ListInventoryByWarehouse,
  SearchInventoryByProductName, ListWarehouses,
} from "../../application/inventory/useCases";
import {
  ListRefunds, GetRefund, ListRefundsByUser, ListRefundsByStatus,
  CreateRefund, ApproveRefund, RejectRefund,
} from "../../application/refunds/useCases";
import { Login } from "../../application/auth/Login";
import type { LoginInput, LoginResult } from "../../application/auth/Login";
import type { Product } from "../../domain/catalog/Product";
import type { CreateProductData, PageParams, PageResult } from "../../application/catalog/ProductRepository";
import type { Notification } from "../../domain/notifications/Notification";
import type { CreateNotificationData } from "../../application/notifications/NotificationRepository";
import type { InventoryItem, Warehouse } from "../../domain/inventory/InventoryItem";
import type { PageParams as InvParams, PageResult as InvResult } from "../../application/inventory/InventoryRepository";
import type { Refund } from "../../domain/refunds/Refund";
import type { CreateRefundData, RefundStatusCode } from "../../application/refunds/RefundRepository";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _RefundStatusCode = RefundStatusCode; // re-export for routes

export interface AppServices {
  login: { execute(input: LoginInput): Promise<LoginResult | null> };
  // catalog
  listProducts: { execute(params: PageParams): Promise<PageResult<Product>> };
  getProduct: { execute(id: number): Promise<Product | null> };
  searchProductsByName: { execute(q: string, params: PageParams): Promise<PageResult<Product>> };
  searchProductsBySku: { execute(q: string, params: PageParams): Promise<PageResult<Product>> };
  createProduct: { execute(input: CreateProductData): Promise<Product> };
  deleteProduct: { execute(id: number): Promise<void> };
  // inventory
  listInventory: { execute(params: InvParams): Promise<InvResult<InventoryItem>> };
  listInventoryByWarehouse: { execute(warehouseId: number, params: InvParams): Promise<InvResult<InventoryItem>> };
  searchInventoryByProductName: { execute(q: string, params: InvParams): Promise<InvResult<InventoryItem>> };
  listWarehouses: { execute(): Promise<Warehouse[]> };
  // refunds
  listRefunds: { execute(): Promise<Refund[]> };
  getRefund: { execute(id: number): Promise<Refund | null> };
  listRefundsByUser: { execute(userId: number): Promise<Refund[]> };
  listRefundsByStatus: { execute(statusCode: import("../../domain/refunds/Refund").RefundStatusCode): Promise<Refund[]> };
  createRefund: { execute(input: CreateRefundData): Promise<Refund> };
  approveRefund: { execute(id: number, approvedBy: number): Promise<Refund | null> };
  rejectRefund: { execute(id: number): Promise<Refund | null> };
  // notifications
  listNotifications: { execute(userId: number): Promise<Notification[]> };
  markNotificationRead: { execute(id: number): Promise<Notification | null> };
  createNotification: { execute(input: CreateNotificationData): Promise<Notification> };
  deleteNotification: { execute(id: number): Promise<void> };
}

export function createContainer(): AppServices {
  const authRepository = new PrismaAuthRepository(prisma);
  const productRepository = new PrismaProductRepository(prisma);
  const inventoryRepository = new PrismaInventoryRepository(prisma);
  const refundRepository = new PrismaRefundRepository(prisma);
  const notificationRepository = new PrismaNotificationRepository(prisma);

  return {
    login: new Login(authRepository),
    listProducts: new ListProducts(productRepository),
    getProduct: new GetProduct(productRepository),
    searchProductsByName: new SearchProductsByName(productRepository),
    searchProductsBySku: new SearchProductsBySku(productRepository),
    createProduct: new CreateProduct(productRepository),
    deleteProduct: new DeleteProduct(productRepository),
    listInventory: new ListInventory(inventoryRepository),
    listInventoryByWarehouse: new ListInventoryByWarehouse(inventoryRepository),
    searchInventoryByProductName: new SearchInventoryByProductName(inventoryRepository),
    listWarehouses: new ListWarehouses(inventoryRepository),
    listRefunds: new ListRefunds(refundRepository),
    getRefund: new GetRefund(refundRepository),
    listRefundsByUser: new ListRefundsByUser(refundRepository),
    listRefundsByStatus: new ListRefundsByStatus(refundRepository),
    createRefund: new CreateRefund(refundRepository),
    approveRefund: new ApproveRefund(refundRepository),
    rejectRefund: new RejectRefund(refundRepository),
    listNotifications: new ListNotifications(notificationRepository),
    markNotificationRead: new MarkNotificationRead(notificationRepository),
    createNotification: new CreateNotification(notificationRepository),
    deleteNotification: new DeleteNotification(notificationRepository),
  };
}
