export const uploadProduct = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file received' })
    }
    const relativeUrl = `/uploads/products/${req.file.filename}`
    res.status(201).json({
      url: relativeUrl,
      filename: req.file.filename,
    })
  } catch (e) {
    res.status(500).json({ message: e.message || 'Upload failed' })
  }
}
