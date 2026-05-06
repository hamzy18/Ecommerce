import Stripe from 'stripe'
import PendingCheckout from '../models/PendingCheckoutSchema.js'
import Order from '../models/OrderSchema.js'
import { buildNormalizedItems, savePaidOrder } from '../services/orderFulfillment.js'

let stripeClient = null

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) return null
  if (!stripeClient) {
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

function publicImageForStripe(url) {
  if (!url || typeof url !== 'string') return undefined
  const u = url.trim()
  if (!/^https?:\/\//i.test(u)) return undefined
  return u
}

export function stripeStatus(_req, res) {
  res.json({ enabled: !!getStripe() })
}

export async function createCheckoutSession(req, res) {
  const stripe = getStripe()
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe is not configured (set STRIPE_SECRET_KEY).' })
  }

  try {
    const { customerName, email, phone, address, items } = req.body
    if (!customerName?.trim() || !email?.trim() || !address?.trim() || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'Missing shipping details or cart items.' })
    }

    const { normalizedItems } = await buildNormalizedItems(items)

    const pending = await PendingCheckout.create({
      payload: {
        customerName: customerName.trim(),
        email: email.trim(),
        phone: (phone || '').trim(),
        address: address.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          name: i.name,
          price: i.price,
          image: i.image,
        })),
        userId: req.user?.role === 'user' ? req.user.id : null,
      },
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    })

    const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

    const line_items = normalizedItems.map((line) => {
      const img = publicImageForStripe(line.image)
      return {
        quantity: line.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(Number(line.price) * 100),
          product_data: {
            name: line.name.slice(0, 120),
            ...(img ? { images: [img] } : {}),
          },
        },
      }
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email.trim(),
      line_items,
      metadata: {
        pendingCheckoutId: pending._id.toString(),
      },
      success_url: `${baseUrl}/checkout/stripe-return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    })

    res.json({ url: session.url })
  } catch (e) {
    res.status(400).json({ message: e.message || 'Could not start Stripe checkout.' })
  }
}

export async function completeStripeSession(req, res) {
  const stripe = getStripe()
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe is not configured.' })
  }

  const { sessionId } = req.body
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ message: 'sessionId is required.' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed yet.' })
    }

    const existing = await Order.findOne({ stripeCheckoutSessionId: session.id })
    if (existing) {
      return res.status(200).json({ success: true, data: existing })
    }

    const pendingId = session.metadata?.pendingCheckoutId
    if (!pendingId) {
      return res.status(400).json({ message: 'Invalid checkout session.' })
    }

    const pending = await PendingCheckout.findById(pendingId)
    if (!pending?.payload) {
      return res.status(400).json({ message: 'Checkout data expired. Place a new order.' })
    }

    const p = pending.payload
    const reqLike =
      p.userId != null && p.userId !== ''
        ? { user: { id: String(p.userId), role: 'user' } }
        : { user: undefined }

    const order = await savePaidOrder({
      req: reqLike,
      customerName: p.customerName,
      email: p.email,
      phone: p.phone,
      address: p.address,
      rawItems: p.items,
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      stripeCheckoutSessionId: session.id,
    })

    await PendingCheckout.findByIdAndDelete(pending._id)
    res.status(201).json({ success: true, data: order })
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Could not complete order.' })
  }
}
