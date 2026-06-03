/**
 * DOMINIO — entidad Producto. Independiente de Prisma, HTTP y DTOs.
 * Las fechas son `Date` (la frontera HTTP las serializa a ISO).
 */
export interface Product {
  id: number;
  sku: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  supplierId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}
