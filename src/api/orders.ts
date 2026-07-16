import { apiClient } from './client'
import type { Product } from './products'

export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export type Customer = {
  id: string
  name: string
  email: string | null
  createdAt: string
}

export type Order = {
  id: string
  productId: string
  customerId: string
  quantity: number
  status: OrderStatus
  total: number
  createdAt: string
  product: Product
  customer: Customer
}

export async function getOrders(signal?: AbortSignal) {
  const response = await apiClient.get<Order[]>('/orders', { signal })
  return response.data
}

export type CreateOrderInput = {
  productId: string
  quantity: number
} & (
  | { customerId: string }
  | { customerName: string; customerEmail: string | null }
)

export async function createOrder(input: CreateOrderInput) {
  const response = await apiClient.post<Order>('/orders', input)
  return response.data
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const response = await apiClient.patch<Order>(`/orders/${orderId}/status`, { status })
  return response.data
}
