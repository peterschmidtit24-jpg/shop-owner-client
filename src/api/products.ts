/** Product API types and request functions used by the catalogue interface. */
import { apiClient } from './client'

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  createdAt: string
}

export type ProductInput = Pick<Product, 'name' | 'description' | 'price' | 'stock' | 'imageUrl'>

/**
 * Fetches the full product catalogue.
 * @param signal - Optional AbortSignal used to cancel an obsolete request.
 * @returns Products returned by the server.
 */
export async function getProducts(signal?: AbortSignal) {
  const response = await apiClient.get<Product[]>('/products', { signal })
  return response.data
}

/**
 * Creates a new product.
 * @param product - Validated product fields collected by the product dialog.
 * @returns The product created by the server.
 */
export async function createProduct(product: ProductInput) {
  const response = await apiClient.post<Product>('/products', product)
  return response.data
}

/**
 * Replaces the editable fields of an existing product.
 * @param productId - UUID of the product to update.
 * @param product - New product field values.
 * @returns The updated product.
 */
export async function updateProduct(productId: string, product: ProductInput) {
  const response = await apiClient.patch<Product>(`/products/${productId}`, product)
  return response.data
}

/**
 * Deletes a product from the catalogue.
 * @param productId - UUID of the product to remove.
 * @returns The server confirmation and deleted product data.
 */
export async function deleteProduct(productId: string) {
  await apiClient.delete(`/products/${productId}`)
}
