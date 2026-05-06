import { getToken } from './client'

export async function uploadProductImage(file) {
  const token = getToken()
  if (!token) throw new Error('Sign in required')

  const fd = new FormData()
  fd.append('image', file)

  const res = await fetch('/api/upload/product', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data.url
}
