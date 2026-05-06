import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import connectDb from './config/config.js'
import { uploadsRoot } from './config/upload.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import { seedAdminUser } from './utils/seedAdmin.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

const _fileName = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_fileName)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
)
app.use(express.json())

app.use('/uploads', express.static(uploadsRoot))

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'E-commerce API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/product', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/reviews', reviewRoutes)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(_dirname, 'Frontend/website/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(_dirname, 'Frontend/website/dist', 'index.html'))
  })
}

async function start() {
  await connectDb()
  await seedAdminUser()
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
