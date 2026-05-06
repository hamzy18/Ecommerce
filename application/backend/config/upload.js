import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const _fileName = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_fileName)

export const uploadsRoot = path.join(_dirname, '..', 'uploads')
export const productImagesDir = path.join(uploadsRoot, 'products')

fs.mkdirSync(productImagesDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, productImagesDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    cb(null, safe)
  },
})

export const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.mimetype)
    cb(ok ? null : new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), ok)
  },
})
