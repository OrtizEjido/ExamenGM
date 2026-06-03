import { prisma } from "../prisma/client";
import { PrismaProductRepository } from "../catalog/PrismaProductRepository";
import {
  CreateProduct,
  DeleteProduct,
  GetProduct,
  ListProducts,
  SearchProducts,
} from "../../application/catalog/useCases";

/** Composition root: cablea adapters concretos con los casos de uso. */
export interface AppServices {
  listProducts: ListProducts;
  getProduct: GetProduct;
  searchProducts: SearchProducts;
  createProduct: CreateProduct;
  deleteProduct: DeleteProduct;
}

export function createContainer(): AppServices {
  const productRepository = new PrismaProductRepository(prisma);
  return {
    listProducts: new ListProducts(productRepository),
    getProduct: new GetProduct(productRepository),
    searchProducts: new SearchProducts(productRepository),
    createProduct: new CreateProduct(productRepository),
    deleteProduct: new DeleteProduct(productRepository),
  };
}
