import Product from '../models/ProductSchema.js'

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const parseBody = (body) => ({
  ...body,
  productPrice: Number(body.productPrice),
  quantity: body.quantity !== undefined && body.quantity !== '' ? Number(body.quantity) : 0,
})

const createProduct = async (req, res) => {
  try {
    const count = await Product.countDocuments()
    const payload = {
      ...parseBody(req.body),
      productID: count + 1,
    }
    if (Number.isNaN(payload.productPrice)) {
      return res.status(400).json({ message: 'Invalid product price' })
    }
    const product = new Product(payload)
    const newProduct = await product.save()
    res.status(201).json(newProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default createProduct

export const getAllProducts = async (req, res) => {
  try {
    const { category, status, q } = req.query
    const andParts = []
    if (category) andParts.push({ category })
    if (status) andParts.push({ status })
    const qTrim = typeof q === 'string' ? q.trim() : ''
    if (qTrim) {
      const safe = escapeRegex(qTrim)
      andParts.push({
        $or: [
          { productName: { $regex: safe, $options: 'i' } },
          { productDescription: { $regex: safe, $options: 'i' } },
        ],
      })
    }
    const filter =
      andParts.length === 0 ? {} : andParts.length === 1 ? andParts[0] : { $and: andParts }
    const allproducts = await Product.find(filter).sort({ createdAt: -1 })
    res.status(200).json(allproducts)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: 'Failed to retrieve products',
    })
  }
}

export const getSingleProduct = async (req, res) => {
  try {
    const id = req.params.id
    const singleProduct = await Product.findById(id)
    if (!singleProduct) {
      return res.status(404).json({
        success: false,
        error: true,
        message: 'Product not found',
      })
    }
    res.status(200).json({
      success: true,
      error: false,
      data: singleProduct,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: 'Failed to retrieve product',
    })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id
    const payload = parseBody(req.body)
    if (Number.isNaN(payload.productPrice)) {
      return res.status(400).json({ message: 'Invalid product price' })
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, payload, { new: true })
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: true,
        message: 'Product not found',
      })
    }
    res.status(200).json({
      success: true,
      error: false,
      data: updatedProduct,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: 'Failed to update product',
    })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id
    const deletedProduct = await Product.findByIdAndDelete(id)
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        error: true,
        message: 'Product not found',
      })
    }
    res.status(200).json({
      success: true,
      error: false,
      data: deletedProduct,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: 'Failed to delete product',
    })
  }
}
