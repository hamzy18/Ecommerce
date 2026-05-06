import { Router } from 'express'
import { createReview, deleteReview, listReviewsForProduct } from '../controllers/reviewController.js'
import { authenticate, requireCustomer } from '../middleware/auth.js'

const router = Router()

router.get('/product/:productId', listReviewsForProduct)
router.post('/', authenticate, requireCustomer, createReview)
router.delete('/:id', authenticate, deleteReview)

export default router
