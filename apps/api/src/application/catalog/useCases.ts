import type { Product } from "../../domain/catalog/Product";
import type {
  CreateProductData,
  ProductRepository,
} from "./ProductRepository";

/** Casos de uso del catálogo. Una responsabilidad cada uno (SRP). */

export class ListProducts {
  constructor(private readonly repo: ProductRepository) {}
  execute(): Promise<Product[]> {
    return this.repo.listActive();
  }
}

export class GetProduct {
  constructor(private readonly repo: ProductRepository) {}
  execute(id: number): Promise<Product | null> {
    return this.repo.findById(id);
  }
}

export class SearchProducts {
  constructor(private readonly repo: ProductRepository) {}
  execute(query: string): Promise<Product[]> {
    return this.repo.search(query);
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
