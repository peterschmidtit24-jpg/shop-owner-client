import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { Owner } from '../api/auth'

type AuthContextValue = {
  owner: Owner | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  completeConfirmation: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi.getSession().then(setOwner).catch(() => setOwner(null)).finally(() => setLoading(false))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => setOwner(await authApi.login(email, password)), [])
  const signOut = useCallback(async () => {
    await authApi.logout()
    setOwner(null)
  }, [])
  const completeConfirmation = useCallback(async (token: string) => setOwner(await authApi.confirmEmail(token)), [])

  const value: AuthContextValue = useMemo(() => ({
    owner,
    loading,
    signIn,
    signOut,
    completeConfirmation,
  }), [owner, loading, signIn, signOut, completeConfirmation])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
