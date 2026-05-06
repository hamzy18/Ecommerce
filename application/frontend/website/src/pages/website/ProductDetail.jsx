import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSingleProduct } from '../../api/apiProduct'
import * as apiReview from '../../api/apiReview'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const PLACEHOLDER = '/assets/images/men-01.jpg'

function StarDisplay({ value }) {
  const v = Math.min(5, Math.max(0, Math.round(Number(value) || 0)))
  return (
    <span className="text-warning me-1" aria-hidden>
      {'★'.repeat(v)}
      <span className="text-secondary">{'☆'.repeat(5 - v)}</span>
    </span>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addItem } = useCart()
  const { user, isCustomer } = useAuth()
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [reviewLoading, setReviewLoading] = useState(true)
  const [reviewError, setReviewError] = useState(null)
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const loadReviews = useCallback(async () => {
    if (!id) return
    setReviewLoading(true)
    setReviewError(null)
    try {
      const json = await apiReview.getReviewsForProduct(id)
      setReviews(Array.isArray(json.data) ? json.data : [])
      setAvgRating(Number(json.averageRating) || 0)
      setReviewCount(Number(json.reviewCount) || 0)
    } catch (e) {
      setReviewError(e.message || 'Could not load reviews')
    } finally {
      setReviewLoading(false)
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getSingleProduct(id)
      .then((data) => {
        if (!cancelled) setProduct(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Product not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '140px' }}>
        <p className="text-muted">Loading…</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container" style={{ paddingTop: '140px' }}>
        <div className="alert alert-warning">{error || 'Product not found.'}</div>
        <Link to="/">Back to shop</Link>
      </div>
    )
  }

  const price = Number(product.productPrice) || 0
  const stock = product.quantity != null ? Number(product.quantity) : null
  const img = product.productImage?.trim() ? product.productImage : PLACEHOLDER
  const outOfStock = stock !== null && stock <= 0
  const inactive = product.status === 'inactive'
  const displayAvg = avgRating || Number(product.averageRating) || 0
  const displayCount = reviewCount || Number(product.reviewCount) || 0
  const myReview = user
    ? reviews.find((r) => String(r.userId) === String(user.id))
    : null

  async function submitReview(e) {
    e.preventDefault()
    setReviewError(null)
    setReviewSubmitting(true)
    try {
      await apiReview.submitReview({
        productId: id,
        rating: ratingInput,
        comment: commentInput,
      })
      setCommentInput('')
      await loadReviews()
      const refreshed = await getSingleProduct(id)
      setProduct(refreshed)
    } catch (err) {
      setReviewError(err.message || 'Could not submit review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function removeReview(reviewId) {
    if (!window.confirm('Remove your review?')) return
    try {
      await apiReview.deleteReview(reviewId)
      await loadReviews()
      const refreshed = await getSingleProduct(id)
      setProduct(refreshed)
    } catch (err) {
      setReviewError(err.message || 'Could not delete')
    }
  }

  return (
    <section style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <img
              src={img}
              alt={product.productName}
              className="img-fluid rounded"
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = PLACEHOLDER
              }}
            />
          </div>
          <div className="col-lg-6">
            <h2>{product.productName}</h2>
            {displayCount > 0 && (
              <p className="mb-2 small">
                <StarDisplay value={displayAvg} />
                <span className="text-muted">
                  {displayAvg.toFixed(1)} ({displayCount} {displayCount === 1 ? 'rating' : 'ratings'})
                </span>
              </p>
            )}
            <p className="h4 text-primary">Rs {price.toFixed(2)}</p>
            {product.category && <p className="text-muted mb-2">Category: {product.category}</p>}
            {stock !== null && (
              <p className="small">
                Stock: {stock} {outOfStock && <span className="badge bg-secondary">Out of stock</span>}
              </p>
            )}
            {inactive && <p className="badge bg-warning text-dark">Inactive listing</p>}
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {product.productDescription || 'No description provided.'}
            </p>
            <div className="d-flex align-items-center gap-3 mt-4 flex-wrap">
              <input
                type="number"
                min={1}
                max={stock != null && Number.isFinite(stock) ? stock : undefined}
                className="form-control"
                style={{ width: '100px' }}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                disabled={outOfStock || inactive}
              />
              <button
                type="button"
                className="btn btn-dark"
                disabled={outOfStock || inactive}
                onClick={() => addItem(product, qty)}
              >
                Add to cart
              </button>
              <Link to="/cart" className="btn btn-outline-secondary">
                View cart
              </Link>
            </div>
          </div>
        </div>

        <div className="row mt-5 pt-4 border-top">
          <div className="col-lg-8">
            <h3 className="h5 mb-3">Customer reviews</h3>
            {reviewError && <div className="alert alert-warning py-2 small">{reviewError}</div>}
            {reviewLoading && <p className="text-muted small">Loading reviews…</p>}
            {!reviewLoading && reviews.length === 0 && (
              <p className="text-muted small">No reviews yet. Be the first to rate this product.</p>
            )}
            <ul className="list-unstyled">
              {reviews.map((r) => (
                <li key={r._id} className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between gap-2 flex-wrap">
                    <div>
                      <strong className="small">{r.userName}</strong>
                      <div className="small">
                        <StarDisplay value={r.rating} />
                      </div>
                    </div>
                    <span className="text-muted small">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {r.comment && <p className="mb-0 small mt-2">{r.comment}</p>}
                  {user &&
                    (user.role === 'admin' || String(r.userId) === String(user.id)) && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-danger p-0 mt-1"
                        onClick={() => removeReview(r._id)}
                      >
                        Delete
                      </button>
                    )}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-4 mt-4 mt-lg-0">
            {isCustomer && !inactive && (
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <h4 className="h6">Write a review</h4>
                  {myReview ? (
                    <p className="small text-muted mb-0">You already reviewed this product.</p>
                  ) : (
                    <form onSubmit={submitReview}>
                      <div className="mb-2">
                        <label className="form-label small">Rating</label>
                        <select
                          className="form-select form-select-sm"
                          value={ratingInput}
                          onChange={(e) => setRatingInput(Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} — {n === 5 ? 'Excellent' : n === 1 ? 'Poor' : 'Good'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small">Comment (optional)</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={3}
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          maxLength={2000}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-dark btn-sm"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? 'Submitting…' : 'Submit review'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
            {!user && (
              <p className="small text-muted">
                <Link to="/login">Sign in</Link> to leave a review.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
