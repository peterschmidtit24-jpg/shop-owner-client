/** Customer API types and request functions used by customer management UI. */
import { apiClient } from './client'

export type Customer = {
  id: string
  name: string
  email: string | null
  createdAt: string
  _count: { orders: number }
}

/**
 * Fetches customers together with their order counts.
 * @param signal - Optional AbortSignal for cancelling an obsolete request.
 * @returns Customers returned by the server.
 */
export async function getCustomers(signal?: AbortSignal) {
  const response = await apiClient.get<Customer[]>('/customers', { signal })
  return response.data
}

/**
 * Updates a customer's editable profile fields.
 * @param customerId - UUID of the customer to update.
 * @param input - New name and nullable email address.
 * @returns The updated customer including its order count.
 */
export async function updateCustomer(customerId: string, input: Pick<Customer, 'name' | 'email'>) {
  const response = await apiClient.patch<Customer>(`/customers/${customerId}`, input)
  return response.data
}
