import mongoose from 'mongoose'
import Review from '../models/ReviewSchema.js'
import Product from '../models/ProductSchema.js'
import User from '../models/UserSchema.js'

async function syncProductReviewStats(productId) {
  const oid = new mongoose.Types.ObjectId(productId)
  const [row] = await Review.aggregate([
    { $match: { productId: oid } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const avg = row?.avg != null ? Math.round(row.avg * 10) / 10 : 0
  const count = row?.count ?? 0
  await Product.findByIdAndUpdate(productId, { averageRating: avg, reviewCount: count })
}

export const listReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' })
    }
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean()
    const product = await Product.findById(productId).select('averageRating reviewCount').lean()
    res.json({
      success: true,
      data: reviews,
      averageRating: product?.averageRating ?? 0,
      reviewCount: product?.reviewCount ?? 0,
    })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' })
    }
    const r = Number(rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1–5' })
    }
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const user = await User.findById(req.user.id).lean()
    const userName = user?.name || 'Customer'

    const review = await Review.create({
      productId,
      userId: req.user.id,
      userName,
      rating: Math.round(r),
      comment: (comment || '').trim().slice(0, 2000),
    })
    await syncProductReviewStats(productId)
    res.status(201).json({ success: true, data: review })
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ success: false, message: 'You already reviewed this product.' })
    }
    res.status(400).json({ success: false, message: e.message })
  }
}

export const deleteReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Sign in required' })
    }
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }
    if (req.user.role !== 'admin' && review.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed' })
    }
    const productId = review.productId
    await review.deleteOne()
    await syncProductReviewStats(productId)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}
