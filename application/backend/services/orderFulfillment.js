import Order from '../models/OrderSchema.js'
import Product from '../models/ProductSchema.js'
import User from '../models/UserSchema.js'

export async function buildNormalizedItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('No line items')
  }
  let total = 0
  const normalizedItems = []
  for (const line of rawItems) {
    const qty = Number(line.quantity) || 0
    if (qty < 1) continue
    const productId = line.productId || undefined
    let price = Number(line.price) || 0
    let name = line.name || 'Item'
    let image = line.image || ''

    if (productId) {
      const product = await Product.findById(productId)
      if (!product) {
        throw new Error(`Product not found: ${productId}`)
      }
      if (product.status !== 'active') {
        throw new Error(`Product not available: "${product.productName}"`)
      }
      if (product.quantity < qty) {
        throw new Error(`Insufficient stock for "${product.productName}"`)
      }
      price = Number(product.productPrice) || 0
      name = product.productName
      image = product.productImage || ''
    }

    total += qty * price
    normalizedItems.push({
      productId,
      name,
      price,
      quantity: qty,
      image,
    })
  }
  if (normalizedItems.length === 0) {
    throw new Error('No valid line items')
  }
  return { normalizedItems, total }
}

export async function decrementStock(normalizedItems) {
  for (const line of normalizedItems) {
    if (!line.productId) continue
    const updated = await Product.findOneAndUpdate(
      { _id: line.productId, quantity: { $gte: line.quantity } },
      { $inc: { quantity: -line.quantity } },
      { new: true }
    )
    if (!updated) {
      const p = await Product.findById(line.productId)
      throw new Error(`Insufficient stock for "${p?.productName || 'item'}"`)
    }
  }
}

async function resolveUserId(req, email) {
  if (req?.user && req.user.role === 'user') {
    const u = await User.findById(req.user.id)
    if (u && u.email.toLowerCase() === String(email).trim().toLowerCase()) {
      return u._id
    }
  }
  return null
}

export async function savePaidOrder({
  req,
  customerName,
  email,
  phone,
  address,
  rawItems,
  paymentMethod,
  paymentStatus,
  stripeCheckoutSessionId,
}) {
  const { normalizedItems, total } = await buildNormalizedItems(rawItems)
  await decrementStock(normalizedItems)
  const userId = await resolveUserId(req, email)

  if (stripeCheckoutSessionId) {
    const dup = await Order.findOne({ stripeCheckoutSessionId })
    if (dup) return dup
  }

  const doc = {
    userId,
    customerName,
    email,
    phone: phone || '',
    address,
    items: normalizedItems,
    total,
    paymentMethod,
    paymentStatus,
  }
  if (stripeCheckoutSessionId) {
    doc.stripeCheckoutSessionId = stripeCheckoutSessionId
  }
  const order = new Order(doc)
  return order.save()
}
