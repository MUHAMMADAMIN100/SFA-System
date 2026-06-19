import { api } from "@/shared/api";

import { Product, ProductInput } from "../model/types";

export async function fetchProducts(activeOnly = false): Promise<Product[]> {
  const { data } = await api.get<Product[]>("/products/", {
    params: activeOnly ? { is_active: true } : undefined,
  });
  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<Product>("/products/", input);
  return data;
}

export async function updateProduct(
  id: number,
  input: Partial<ProductInput>
): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}/`, input);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}/`);
}
