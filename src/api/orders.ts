/** Order API types and request functions used by the dashboard and order page. */
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

/**
 * Fetches all orders with their related product and customer.
 * @param signal - Optional AbortSignal used when a component unmounts.
 * @returns Orders returned by the API.
 */
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

/**
 * Creates an order and reserves its product quantity on the server.
 * @param input - Product, customer, and quantity selected in the order dialog.
 * @returns The newly created order.
 */
export async function createOrder(input: CreateOrderInput) {
  const response = await apiClient.post<Order>('/orders', input)
  return response.data
}

/**
 * Moves an order to another workflow status.
 * @param orderId - UUID of the order to change.
 * @param status - One of the status values accepted by the API.
 * @returns The updated order including product and customer data.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const response = await apiClient.patch<Order>(`/orders/${orderId}/status`, { status })
  return response.data
}
