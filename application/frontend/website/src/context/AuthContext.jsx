import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as apiAuth from '../api/apiAuth'
import { getToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => apiAuth.loadStoredUser())
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const me = await apiAuth.fetchMe()
    if (me) {
      setUser(me)
      localStorage.setItem('hexashop_user', JSON.stringify(me))
    } else {
      setUser(null)
      apiAuth.clearSession()
    }
    return me
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const me = await apiAuth.fetchMe()
        if (!cancelled && me) setUser(me)
        if (!cancelled && !me) apiAuth.clearSession()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await apiAuth.loginRequest(email, password)
    apiAuth.persistSession(token, u)
    setUser(u)
    return u
  }, [])

  const adminLogin = useCallback(async (email, password) => {
    const { token, user: u } = await apiAuth.adminLoginRequest(email, password)
    apiAuth.persistSession(token, u)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (payload) => {
    const { token, user: u } = await apiAuth.registerRequest(payload)
    apiAuth.persistSession(token, u)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    apiAuth.clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      isCustomer: user?.role === 'user',
      login,
      adminLogin,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, adminLogin, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
