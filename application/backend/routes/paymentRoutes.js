import { Router } from 'express'
import {
  completeStripeSession,
  createCheckoutSession,
  stripeStatus,
} from '../controllers/stripeController.js'
import { optionalAuthenticate } from '../middleware/auth.js'

const router = Router()

router.get('/stripe/status', stripeStatus)
router.post('/stripe/create-checkout-session', optionalAuthenticate, createCheckoutSession)
router.post('/stripe/complete', completeStripeSession)

export default router
