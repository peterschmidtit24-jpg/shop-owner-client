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

export async function getProducts(signal?: AbortSignal) {
  const response = await apiClient.get<Product[]>('/products', { signal })
  return response.data
}

export async function createProduct(product: ProductInput) {
  const response = await apiClient.post<Product>('/products', product)
  return response.data
}

export async function updateProduct(productId: string, product: ProductInput) {
  const response = await apiClient.patch<Product>(`/products/${productId}`, product)
  return response.data
}

export async function deleteProduct(productId: string) {
  await apiClient.delete(`/products/${productId}`)
}
