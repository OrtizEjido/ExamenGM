import type { CatalogRepository, PageParams, ProductPage } from "./CatalogRepository";

export class ListProducts {
  constructor(private readonly repository: CatalogRepository) {}
  execute(params: PageParams): Promise<ProductPage> {
    return this.repository.listPaginated(params);
  }
}

export class SearchProductsByName {
  constructor(private readonly repository: CatalogRepository) {}
  execute(query: string, params: PageParams): Promise<ProductPage> {
    return this.repository.searchByName(query, params);
  }
}

export class SearchProductsBySku {
  constructor(private readonly repository: CatalogRepository) {}
  execute(query: string, params: PageParams): Promise<ProductPage> {
    return this.repository.searchBySku(query, params);
  }
}
