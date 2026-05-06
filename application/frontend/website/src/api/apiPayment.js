import { authHeaders } from './client'

const BASE = '/api/payments'

export async function fetchStripeStatus() {
  const res = await fetch(`${BASE}/stripe/status`)
  if (!res.ok) return { enabled: false }
  return res.json()
}

export async function createStripeCheckoutSession(payload) {
  const res = await fetch(`${BASE}/stripe/create-checkout-session`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || 'Could not start Stripe checkout.')
  return json
}

export async function completeStripeOrder(sessionId) {
  const res = await fetch(`${BASE}/stripe/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || 'Could not finalize order.')
  return json
}
