import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true, maxlength: 2000 },
  },
  { timestamps: true }
)

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

const Review = mongoose.model('Review', ReviewSchema)
export default Review
