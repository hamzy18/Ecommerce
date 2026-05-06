import jwt from 'jsonwebtoken'

function getSecret() {
  const s = process.env.JWT_SECRET || 'hexashop-dev-jwt-secret-change-me'
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production')
  }
  return s
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function authenticate(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Sign in required' })
  }
  try {
    const decoded = jwt.verify(h.slice(7), getSecret())
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    }
    next()
  } catch {
    return res.status(401).json({ message: 'Session expired or invalid' })
  }
}

export function optionalAuthenticate(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return next()
  try {
    const decoded = jwt.verify(h.slice(7), getSecret())
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    }
  } catch {
    /* ignore invalid token for optional auth */
  }
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Sign in required' })
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required' })
  }
  next()
}

export function requireCustomer(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Sign in required' })
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Customer account required' })
  }
  next()
}
