import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createProduct, getSingleProduct, updateProduct } from '../api/apiProduct'
import { uploadProductImage } from '../api/apiUpload'

const empty = {
  productName: '',
  productPrice: '',
  category: 'General',
  productDescription: '',
  productImage: '',
  quantity: '',
  status: 'active',
}

export default function Form() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [value, setValue] = useState(empty)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getSingleProduct(id)
      .then((p) => {
        if (cancelled || !p) return
        setValue({
          productName: p.productName || '',
          productPrice: p.productPrice ?? '',
          category: p.category || 'General',
          productDescription: p.productDescription || '',
          productImage: p.productImage || '',
          quantity: p.quantity ?? '',
          status: p.status || 'active',
        })
      })
      .catch((e) => setError(e.message || 'Failed to load product'))
      .finally(() => setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

function handleChange(event) {
    const { name, value: v } = event.target
    setValue((prev) => ({ ...prev, [name]: v }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      setValue((prev) => ({ ...prev, productImage: url }))
    } catch (err) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!value.productName?.trim()) {
      newErrors.productName = 'Product name is required.'
    }
    if (!value.productPrice || Number(value.productPrice) <= 0) {
      newErrors.productPrice = 'Valid price > 0 is required.'
    }
    if (value.productImage?.trim() && !isValidUrl(value.productImage)) {
      newErrors.productImage = 'Invalid image URL.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    const s = string.trim()
    if (!s) return true
    // Uploads and same-origin assets use root-relative paths (e.g. /uploads/...)
    if (s.startsWith('/')) {
      return !s.startsWith('//')
    }
    try {
      new URL(s)
      return true
    } catch {
      return false
    }
  }

  async function handleSubmission(event) {
    event.preventDefault()
    if (!validateForm()) {
      return
    }
    setError(null)
    setSaving(true)
    const payload = {
      productName: value.productName.trim(),
      productPrice: Number(value.productPrice),
      category: value.category.trim() || 'General',
      productDescription: value.productDescription.trim(),
      productImage: value.productImage.trim(),
      quantity: value.quantity === '' ? 0 : Number(value.quantity),
      status: value.status,
    }
    try {
      if (isEdit) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }
      navigate('/product-dashboard')
    } catch (e) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mt-5" style={{ paddingTop: '80px' }}>
        <p className="text-muted">Loading…</p>
      </div>
    )
  }

  const previewSrc =
    value.productImage?.trim() ||
    'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="#ddd"><rect width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="18">No image</text></svg>'
      )

  return (
    <form onSubmit={handleSubmission}>
      <div className="container mt-5" style={{ paddingTop: '80px', paddingBottom: '48px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{isEdit ? 'Edit product' : 'Add product'}</h4>
          <Link to="/product-dashboard" className="btn btn-outline-secondary btn-sm">
            Back to dashboard
          </Link>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-lg border-0">
          <div className="card-header bg-dark text-white text-center">
            <h4 className="mb-0">{isEdit ? 'Edit Product' : 'Add Product'}</h4>
          </div>

          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-5 mb-3 mb-md-0">
                <label className="form-label fw-semibold">Product image</label>
                <div
                  className="border rounded overflow-hidden bg-light mb-3"
                  style={{ maxWidth: 320, aspectRatio: '1' }}
                >
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/assets/images/men-01.jpg'
                    }}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <p className="small text-muted mt-2 mb-0">
                  {uploading ? 'Uploading…' : 'JPEG, PNG, WebP or GIF — max 5 MB.'}
                </p>
              </div>
              <div className="col-md-7">
                <div className="mb-3">
                  <label className="form-label">Image URL (optional)</label>
                  <input
                    type="text"
                    name="productImage"
                    className="form-control"
                    placeholder="https://... or /uploads/... after file upload"
                    inputMode="url"
                    autoComplete="off"
                    value={value.productImage}
                    onChange={handleChange}
                  />
                  {errors.productImage && (
                    <small className="text-danger d-block mt-1">{errors.productImage}</small>
                  )}
                  <p className="small text-muted mb-0 mt-1">
                    Paste an external URL, or upload a file — upload fills this field automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Product name</label>
              <input
                type="text"
                name="productName"
                className="form-control"
                placeholder="Product name"
                required
                value={value.productName}
                onChange={handleChange}
              />
              {errors.productName && (
                <small className="text-danger d-block mt-1">{errors.productName}</small>
              )}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  name="productPrice"
                  className="form-control"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  value={value.productPrice}
                  onChange={handleChange}
                />
                {errors.productPrice && (
                  <small className="text-danger d-block mt-1">{errors.productPrice}</small>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Stock quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  placeholder="0"
                  min="0"
                  value={value.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                name="category"
                className="form-control"
                placeholder="e.g. Electronics, Clothing"
                value={value.category}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="productDescription"
                className="form-control"
                rows={4}
                placeholder="Product description"
                value={value.productDescription}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={value.status}
                onChange={handleChange}
              >
                <option value="active">Active (visible in shop)</option>
                <option value="inactive">Inactive (hidden from shop)</option>
              </select>
            </div>

            <div className="d-flex justify-content-between gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setValue(empty)}
                disabled={isEdit}
              >
                Reset
              </button>
              <button type="submit" className="btn btn-success" disabled={saving || uploading}>
                {saving ? 'Saving…' : isEdit ? 'Update product' : 'Add product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
