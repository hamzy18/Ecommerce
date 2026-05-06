import Order from '../models/OrderSchema.js'
import { savePaidOrder } from '../services/orderFulfillment.js'

export const createOrder = async (req, res) => {
  try {
    const { customerName, email, phone, address, items, paymentMethod, paymentStatus } = req.body
    if (!customerName || !email || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields or empty cart',
      })
    }
    if (paymentMethod !== 'jazzcash' || paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Complete the JazzCash demo payment step before placing your order.',
      })
    }

    const saved = await savePaidOrder({
      req,
      customerName,
      email,
      phone,
      address,
      rawItems: items,
      paymentMethod: 'jazzcash',
      paymentStatus: 'paid',
    })
    res.status(201).json({ success: true, data: saved })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, data: order })
    }
    if (req.user.role === 'user') {
      const uid = order.userId?.toString()
      if (!uid || uid !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }
      return res.status(200).json({ success: true, data: order })
    }
    return res.status(403).json({ success: false, message: 'Access denied' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending', 'processing', 'shipped', 'completed']
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    res.status(200).json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
