import type { Product } from "../../domain/catalog/Product";
import type {
  CreateProductData,
  PageParams,
  PageResult,
  ProductRepository,
} from "./ProductRepository";

export class ListProducts {
  constructor(private readonly repo: ProductRepository) {}
  execute(params: PageParams): Promise<PageResult<Product>> {
    return this.repo.listPaginated(params);
  }
}

export class GetProduct {
  constructor(private readonly repo: ProductRepository) {}
  execute(id: number): Promise<Product | null> {
    return this.repo.findById(id);
  }
}

export class SearchProductsByName {
  constructor(private readonly repo: ProductRepository) {}
  execute(query: string, params: PageParams): Promise<PageResult<Product>> {
    return this.repo.searchByName(query, params);
  }
}

export class SearchProductsBySku {
  constructor(private readonly repo: ProductRepository) {}
  execute(query: string, params: PageParams): Promise<PageResult<Product>> {
    return this.repo.searchBySku(query, params);
  }
}

export class CreateProduct {
  constructor(private readonly repo: ProductRepository) {}
  execute(input: CreateProductData): Promise<Product> {
    return this.repo.create(input);
  }
}

export class DeleteProduct {
  constructor(private readonly repo: ProductRepository) {}
  execute(id: number): Promise<void> {
    return this.repo.softDelete(id);
  }
}
