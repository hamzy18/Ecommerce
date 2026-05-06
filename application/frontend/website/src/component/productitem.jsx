import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const PLACEHOLDER = '/assets/images/men-01.jpg'

export default function ProductItem({ product }) {
  const { addItem } = useCart()
  if (!product) return null

  const id = product._id
  const name = product.productName || 'Product'
  const price = Number(product.productPrice) || 0
  const img = product.productImage?.trim() ? product.productImage : PLACEHOLDER
  const stock = product.quantity != null ? Number(product.quantity) : null
  const outOfStock = stock !== null && stock <= 0
  const inactive = product.status === 'inactive'
  const rc = Number(product.reviewCount) || 0
  const ar = Number(product.averageRating) || 0

  return (
    <div className="col-lg-4 col-md-6">
      <div className="item">
        <div className="thumb">
          <div className="hover-content">
            <ul>
              <li>
                <Link to={`/product/${id}`}>
                  <i className="fa fa-eye"></i>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="border-0 bg-transparent p-0"
                  style={{ cursor: outOfStock || inactive ? 'not-allowed' : 'pointer' }}
                  disabled={outOfStock || inactive}
                  onClick={() => !outOfStock && !inactive && addItem(product, 1)}
                  aria-label="Add to cart"
                >
                  <i className="fa fa-shopping-cart"></i>
                </button>
              </li>
            </ul>
          </div>
          <Link to={`/product/${id}`}>
            <img
              src={img}
              alt={name}
              style={{ width: '100%', height: '320px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = PLACEHOLDER
              }}
            />
          </Link>
        </div>
        <div className="down-content">
          <h4>{name}</h4>
          {rc > 0 && (
            <p className="small text-warning mb-1" aria-label={`${ar.toFixed(1)} of 5 stars`}>
              {'★'.repeat(Math.min(5, Math.round(ar)))}
              <span className="text-muted ms-1" style={{ fontSize: '0.85em' }}>
                ({rc})
              </span>
            </p>
          )}
          <span>Rs {price.toFixed(2)}</span>
          {product.category && (
            <p className="mb-0 mt-1 small text-muted">{product.category}</p>
          )}
          {outOfStock && <span className="badge bg-secondary mt-1">Out of stock</span>}
          {inactive && <span className="badge bg-warning text-dark mt-1">Inactive</span>}
        </div>
      </div>
    </div>
  )
}
