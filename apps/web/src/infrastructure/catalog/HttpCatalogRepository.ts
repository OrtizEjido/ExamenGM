import type { ProductPage as ProductPageDto } from "@erp/types";
import type { CatalogRepository, PageParams, ProductPage } from "@/application/catalog/CatalogRepository";
import type { Product } from "@/domain/catalog/Product";
import { apiGet } from "../http/apiClient";

function dtoToPage(dto: ProductPageDto): ProductPage {
  return {
    items: dto.items.map((d): Product => ({
      id: d.id, sku: d.sku, name: d.name, description: d.description,
      price: d.price, category: d.category, supplierId: d.supplierId,
      createdAt: d.createdAt, updatedAt: d.updatedAt, deletedAt: d.deletedAt,
    })),
    total: dto.total,
    page: dto.page,
    limit: dto.limit,
    pages: dto.pages,
  };
}

function pageQs({ page, limit }: PageParams): string {
  return `page=${page}&limit=${limit}`;
}

export class HttpCatalogRepository implements CatalogRepository {
  async listPaginated(params: PageParams): Promise<ProductPage> {
    const dto = await apiGet<ProductPageDto>(`/api/products?${pageQs(params)}`);
    return dtoToPage(dto);
  }

  async searchByName(query: string, params: PageParams): Promise<ProductPage> {
    const dto = await apiGet<ProductPageDto>(
      `/api/products/search/name?q=${encodeURIComponent(query)}&${pageQs(params)}`,
    );
    return dtoToPage(dto);
  }

  async searchBySku(query: string, params: PageParams): Promise<ProductPage> {
    const dto = await apiGet<ProductPageDto>(
      `/api/products/search/sku?q=${encodeURIComponent(query)}&${pageQs(params)}`,
    );
    return dtoToPage(dto);
  }
}
