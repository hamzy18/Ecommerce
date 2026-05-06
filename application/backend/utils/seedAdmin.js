import bcrypt from 'bcrypt'
import User from '../models/UserSchema.js'

export async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.log(
      'Tip: set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create an admin account on startup.'
    )
    return
  }
  const existing = await User.findOne({ email })
  if (existing) return
  const passwordHash = await bcrypt.hash(password, 10)
  await User.create({
    name: 'Administrator',
    email,
    passwordHash,
    role: 'admin',
  })
  console.log(`Admin user created: ${email}`)
}
