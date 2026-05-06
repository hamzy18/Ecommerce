import createProduct, {
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from '../controllers/ProductController.js'
import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/allproducts', getAllProducts)
router.get('/getsingleproduct/:id', getSingleProduct)
router.post('/createproduct', authenticate, requireAdmin, createProduct)
router.put('/updateproduct/:id', authenticate, requireAdmin, updateProduct)
router.delete('/deleteproduct/:id', authenticate, requireAdmin, deleteProduct)

export default router
