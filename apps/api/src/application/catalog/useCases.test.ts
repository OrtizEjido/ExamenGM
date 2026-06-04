import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ListProducts,
  GetProduct,
  SearchProducts,
  CreateProduct,
  DeleteProduct,
} from "./useCases";
import type { ProductRepository } from "./ProductRepository";
import type { Product } from "../../domain/catalog/Product";

const NOW = new Date("2025-01-15T00:00:00.000Z");

const makeProduct = (overrides?: Partial<Product>): Product => ({
  id: 1,
  sku: "SKU-00001",
  name: "Producto Demo",
  description: null,
  price: 100,
  category: "Limpieza",
  supplierId: 1,
  createdAt: NOW,
  updatedAt: NOW,
  deletedAt: null,
  ...overrides,
});

const makeRepo = (): ProductRepository => ({
  listActive: vi.fn(),
  findById: vi.fn(),
  search: vi.fn(),
  create: vi.fn(),
  softDelete: vi.fn(),
});

describe("ListProducts", () => {
  it("devuelve los productos activos del repositorio", async () => {
    const repo = makeRepo();
    const products = [makeProduct(), makeProduct({ id: 2, sku: "SKU-00002" })];
    vi.mocked(repo.listActive).mockResolvedValue(products);

    const result = await new ListProducts(repo).execute();

    expect(result).toEqual(products);
    expect(repo.listActive).toHaveBeenCalledOnce();
  });
});

describe("GetProduct", () => {
  it("retorna el producto cuando existe", async () => {
    const repo = makeRepo();
    const product = makeProduct();
    vi.mocked(repo.findById).mockResolvedValue(product);

    const result = await new GetProduct(repo).execute(1);

    expect(result).toEqual(product);
    expect(repo.findById).toHaveBeenCalledWith(1);
  });

  it("retorna null cuando no existe", async () => {
    const repo = makeRepo();
    vi.mocked(repo.findById).mockResolvedValue(null);

    const result = await new GetProduct(repo).execute(999);

    expect(result).toBeNull();
  });
});

describe("SearchProducts", () => {
  it("delega la búsqueda al repositorio con el query dado", async () => {
    const repo = makeRepo();
    const matches = [makeProduct({ name: "Café Especial" })];
    vi.mocked(repo.search).mockResolvedValue(matches);

    const result = await new SearchProducts(repo).execute("Café");

    expect(result).toEqual(matches);
    expect(repo.search).toHaveBeenCalledWith("Café");
  });
});

describe("CreateProduct", () => {
  it("crea el producto con los datos proporcionados", async () => {
    const repo = makeRepo();
    const created = makeProduct({ sku: "SKU-NEW", name: "Nuevo" });
    vi.mocked(repo.create).mockResolvedValue(created);

    const result = await new CreateProduct(repo).execute({
      sku: "SKU-NEW",
      name: "Nuevo",
      price: 50,
      category: "Test",
      supplierId: 1,
    });

    expect(result).toEqual(created);
    expect(repo.create).toHaveBeenCalledOnce();
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
