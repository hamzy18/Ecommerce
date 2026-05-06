import { authHeaders } from './client'

const BASE = '/api/product'

export const createProduct = async (data) => {
  const res = await fetch(`${BASE}/createproduct`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to create product')
  }
  return res.json()
}

export const getProducts = async (params = {}) => {
  const q = new URLSearchParams()
  if (params.category) q.set('category', params.category)
  if (params.status) q.set('status', params.status)
  if (params.q?.trim()) q.set('q', params.q.trim())
  const qs = q.toString()
  const url = qs ? `${BASE}/allproducts?${qs}` : `${BASE}/allproducts`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load products')
  return res.json()
}

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE}/deleteproduct/${id}`, {
    method: 'DELETE',
    headers: authHeaders(false),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to delete product')
  }
  return res.json()
}

export const updateProduct = async (id, data) => {
  const res = await fetch(`${BASE}/updateproduct/${id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to update product')
  }
  return res.json()
}

export const getSingleProduct = async (id) => {
  const res = await fetch(`${BASE}/getsingleproduct/${id}`)
  if (!res.ok) throw new Error('Failed to load product')
  const json = await res.json()
  if (json.data) return json.data
  return json
}
