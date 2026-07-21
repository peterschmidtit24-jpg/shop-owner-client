import { apiClient } from './client'

export type Owner = {
  id: string
  name: string
  approved: boolean
}

export async function getSession() {
  const { data } = await apiClient.get<{ owner: Owner | null }>('/auth/session')
  return data.owner
}

export async function login(name: string, password: string) {
  const { data } = await apiClient.post<{ owner: Owner }>('/auth/login', { name, password })
  return data.owner
}

export async function register(name: string, password: string) {
  const { data } = await apiClient.post<{ owner: Owner }>('/auth/register', { name, password })
  return data.owner
}

export async function logout() {
  await apiClient.post('/auth/logout')
}
