import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadProductImage } from '../config/upload.js'
import { uploadProduct } from '../controllers/uploadController.js'

const router = Router()

router.post(
  '/product',
  authenticate,
  requireAdmin,
  (req, res, next) => {
    uploadProductImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || 'Invalid file' })
      }
      next()
    })
  },
  uploadProduct
)

export default router
