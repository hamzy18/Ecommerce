import { authHeaders, setToken } from './client'

const BASE = '/api/auth'

export async function registerRequest({ name, email, password }) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Registration failed')
  return data
}

export async function loginRequest(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Sign in failed')
  return data
}

export async function adminLoginRequest(email, password) {
  const res = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Admin sign in failed')
  return data
}

export async function fetchMe() {
  const res = await fetch(`${BASE}/me`, { headers: authHeaders(false) })
  if (!res.ok) return null
  const data = await res.json()
  return data.user || null
}

export function persistSession(token, user) {
  setToken(token)
  localStorage.setItem('hexashop_user', JSON.stringify(user))
}

export function clearSession() {
  setToken(null)
  localStorage.removeItem('hexashop_user')
}

export function loadStoredUser() {
  try {
    const raw = localStorage.getItem('hexashop_user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}
