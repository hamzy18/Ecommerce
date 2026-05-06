import { Router } from 'express'
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/OrderController.js'
import {
  authenticate,
  optionalAuthenticate,
  requireAdmin,
  requireCustomer,
} from '../middleware/auth.js'

const router = Router()

router.post('/create', optionalAuthenticate, createOrder)
router.get('/my', authenticate, requireCustomer, getMyOrders)
router.get('/all', authenticate, requireAdmin, getAllOrders)
router.get('/:id', authenticate, getOrderById)
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus)

export default router
