import { apiClient } from './client'

export type Customer = {
  id: string
  name: string
  email: string | null
  createdAt: string
  _count: { orders: number }
}

export async function getCustomers(signal?: AbortSignal) {
  const response = await apiClient.get<Customer[]>('/customers', { signal })
  return response.data
}

export async function updateCustomer(customerId: string, input: Pick<Customer, 'name' | 'email'>) {
  const response = await apiClient.patch<Customer>(`/customers/${customerId}`, input)
  return response.data
}
