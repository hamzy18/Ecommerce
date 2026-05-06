import { authHeaders } from './client'

const BASE = '/api/orders'

export const createOrder = async (payload) => {
  const res = await fetch(`${BASE}/create`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || 'Failed to place order')
  return json
}

export const getOrders = async () => {
  const res = await fetch(`${BASE}/all`, { headers: authHeaders(false) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to load orders')
  }
  const json = await res.json()
  return json.data || json
}

export const getMyOrders = async () => {
  const res = await fetch(`${BASE}/my`, { headers: authHeaders(false) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to load your orders')
  }
  const json = await res.json()
  return json.data || json
}

export const updateOrderStatus = async (id, status) => {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to update order')
  }
  return res.json()
}
