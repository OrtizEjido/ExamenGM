import { describe, it, expect, vi } from "vitest";
import {
  ListProducts,
  GetProduct,
  SearchProductsByName,
  SearchProductsBySku,
  CreateProduct,
  DeleteProduct,
} from "./useCases";
import type { ProductRepository, PageParams, PageResult } from "./ProductRepository";
import type { Product } from "../../domain/catalog/Product";

const NOW = new Date("2025-01-15T00:00:00.000Z");
const PAGE: PageParams = { page: 1, limit: 20 };

const makeProduct = (overrides?: Partial<Product>): Product => ({
  id: 1, sku: "SKU-00001", name: "Producto Demo", description: null,
  price: 100, category: "Limpieza", supplierId: 1,
  createdAt: NOW, updatedAt: NOW, deletedAt: null,
  ...overrides,
});

const makePage = (items: Product[]): PageResult<Product> => ({
  items, total: items.length, page: 1, limit: 20,
  pages: Math.ceil(items.length / 20),
});

const makeRepo = (): ProductRepository => ({
  listPaginated: vi.fn(),
  findById: vi.fn(),
  searchByName: vi.fn(),
  searchBySku: vi.fn(),
  create: vi.fn(),
  softDelete: vi.fn(),
});

describe("ListProducts", () => {
  it("devuelve la página de productos activos", async () => {
    const repo = makeRepo();
    const page = makePage([makeProduct(), makeProduct({ id: 2 })]);
    vi.mocked(repo.listPaginated).mockResolvedValue(page);

    const result = await new ListProducts(repo).execute(PAGE);

    expect(result.items).toHaveLength(2);
    expect(repo.listPaginated).toHaveBeenCalledWith(PAGE);
  });
});

describe("GetProduct", () => {
  it("retorna el producto cuando existe", async () => {
    const repo = makeRepo();
    vi.mocked(repo.findById).mockResolvedValue(makeProduct());
    expect(await new GetProduct(repo).execute(1)).toBeDefined();
  });
  it("retorna null cuando no existe", async () => {
    const repo = makeRepo();
    vi.mocked(repo.findById).mockResolvedValue(null);
    expect(await new GetProduct(repo).execute(999)).toBeNull();
  });
});

describe("SearchProductsByName", () => {
  it("delega la búsqueda por nombre con paginación", async () => {
    const repo = makeRepo();
    const page = makePage([makeProduct({ name: "Café Especial" })]);
    vi.mocked(repo.searchByName).mockResolvedValue(page);

    const result = await new SearchProductsByName(repo).execute("Café", PAGE);

    expect(result.items[0]?.name).toBe("Café Especial");
    expect(repo.searchByName).toHaveBeenCalledWith("Café", PAGE);
  });
});

describe("SearchProductsBySku", () => {
  it("delega la búsqueda por SKU con paginación", async () => {
    const repo = makeRepo();
    const page = makePage([makeProduct({ sku: "SKU-00014" })]);
    vi.mocked(repo.searchBySku).mockResolvedValue(page);

    const result = await new SearchProductsBySku(repo).execute("14", PAGE);

    expect(result.items[0]?.sku).toBe("SKU-00014");
    expect(repo.searchBySku).toHaveBeenCalledWith("14", PAGE);
  });
});

describe("CreateProduct", () => {
  it("crea el producto con los datos proporcionados", async () => {
    const repo = makeRepo();
    vi.mocked(repo.create).mockResolvedValue(makeProduct({ sku: "SKU-NEW" }));
    const result = await new CreateProduct(repo).execute({ sku: "SKU-NEW", name: "Nuevo", price: 50, category: "Test", supplierId: 1 });
    expect(result.sku).toBe("SKU-NEW");
  });
});

describe("DeleteProduct", () => {
  it("llama softDelete con el id correcto", async () => {
    const repo = makeRepo();
    vi.mocked(repo.softDelete).mockResolvedValue(undefined);
    await new DeleteProduct(repo).execute(1);
    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });
});
