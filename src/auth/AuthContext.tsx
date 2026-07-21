import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { Owner } from '../api/auth'

type AuthContextValue = {
  owner: Owner | null
  loading: boolean
  signIn: (name: string, password: string) => Promise<void>
  register: (name: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi.getSession().then(setOwner).catch(() => setOwner(null)).finally(() => setLoading(false))
  }, [])

  const signIn = useCallback(async (name: string, password: string) => setOwner(await authApi.login(name, password)), [])
  const register = useCallback(async (name: string, password: string) => setOwner(await authApi.register(name, password)), [])
  const signOut = useCallback(async () => {
    await authApi.logout()
    setOwner(null)
  }, [])
  const value: AuthContextValue = useMemo(() => ({
    owner,
    loading,
    signIn,
    register,
    signOut,
  }), [owner, loading, signIn, register, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
