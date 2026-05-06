import bcrypt from 'bcrypt'
import User from '../models/UserSchema.js'
import { signToken } from '../middleware/auth.js'

function userResponse(userDoc) {
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
  }
}

function issueToken(userDoc) {
  const payload = {
    sub: userDoc._id.toString(),
    email: userDoc.email,
    role: userDoc.role,
    name: userDoc.name,
  }
  return signToken(payload)
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    const exists = await User.findOne({ email: email.trim().toLowerCase() })
    if (exists) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'user',
    })
    const token = issueToken(user)
    res.status(201).json({ token, user: userResponse(user) })
  } catch (e) {
    res.status(500).json({ message: e.message || 'Registration failed' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'This account uses the admin sign-in page.',
        code: 'USE_ADMIN_LOGIN',
      })
    }
    const token = issueToken(user)
    res.json({ token, user: userResponse(user) })
  } catch (e) {
    res.status(500).json({ message: e.message || 'Sign in failed' })
  }
}

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid administrator credentials' })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid administrator credentials' })
    }
    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'This email is not an administrator account.',
        code: 'NOT_ADMIN',
      })
    }
    const token = issueToken(user)
    res.json({ token, user: userResponse(user) })
  } catch (e) {
    res.status(500).json({ message: e.message || 'Admin sign in failed' })
  }
}

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) {
      return res.status(404).json({ message: 'Account not found' })
    }
    res.json({ user: userResponse(user) })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
