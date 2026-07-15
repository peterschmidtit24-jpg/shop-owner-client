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

export async function getProducts(signal?: AbortSignal) {
  const response = await apiClient.get<Product[]>('/products', { signal })
  return response.data
}
