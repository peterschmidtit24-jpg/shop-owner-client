/**
 * Shared HTTP client for the Shop Owner API.
 *
 * Centralizing the base URL and JSON headers keeps every feature API module
 * consistent and allows deployments to configure the server with VITE_API_URL.
 */
import axios from 'axios'

/** Axios instance used for all product, order, and customer requests. */
export const apiClient = axios.create({
  // Production requests go through the frontend deployment so the session
  // cookie remains first-party on browsers that block cross-site cookies.
  // Local development can still point directly at the Express server.
  baseURL: import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api')
    : '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})
