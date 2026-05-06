import { authHeaders } from './client'

const BASE = '/api/reviews'

export async function getReviewsForProduct(productId) {
  const res = await fetch(`${BASE}/product/${productId}`)
  if (!res.ok) throw new Error('Failed to load reviews')
  return res.json()
}

export async function submitReview({ productId, rating, comment }) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ productId, rating, comment }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || 'Could not submit review')
  return json
}

export async function deleteReview(reviewId) {
  const res = await fetch(`${BASE}/${reviewId}`, {
    method: 'DELETE',
    headers: authHeaders(false),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || 'Could not delete review')
  return json
}
