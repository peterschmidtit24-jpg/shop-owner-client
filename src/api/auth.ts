import { apiClient } from './client'

export type Owner = {
  id: string
  name: string
  email: string
  confirmed: boolean
  approved: boolean
}

export async function getSession() {
  const { data } = await apiClient.get<{ owner: Owner | null }>('/auth/session')
  return data.owner
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<{ owner: Owner }>('/auth/login', { email, password })
  return data.owner
}

export async function register(name: string, email: string, password: string) {
  const { data } = await apiClient.post<{ message: string; confirmationUrl?: string }>('/auth/register', { name, email, password })
  return data
}

export async function confirmEmail(token: string) {
  const { data } = await apiClient.post<{ owner: Owner }>('/auth/confirm-email', { token })
  return data.owner
}

export async function logout() {
  await apiClient.post('/auth/logout')
}
