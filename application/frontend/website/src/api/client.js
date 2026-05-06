const TOKEN_KEY = 'hexashop_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function authHeaders(jsonBody = false) {
  const headers = {}
  if (jsonBody) headers['Content-Type'] = 'application/json'
  const t = getToken()
  if (t) headers.Authorization = `Bearer ${t}`
  return headers
}
