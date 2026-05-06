import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    productID: {
      type: Number,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    productDescription: {
      type: String,
      default: '',
      trim: true,
    },
    productImage: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
)

const Product = mongoose.model('Product', ProductSchema)
export default Product
