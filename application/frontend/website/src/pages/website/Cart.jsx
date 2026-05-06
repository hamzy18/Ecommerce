import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const PLACEHOLDER = '/assets/images/men-01.jpg'

export default function Cart() {
  const { items, updateQuantity, removeItem, cartTotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <h2>Your cart</h2>
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/" className="btn btn-dark">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <h2 className="mb-4">Your cart</h2>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((line) => (
              <tr key={line.productId}>
                <td style={{ width: 80 }}>
                  <img
                    src={line.image || PLACEHOLDER}
                    alt=""
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    onError={(e) => {
                      e.target.src = PLACEHOLDER
                    }}
                  />
                </td>
                <td>{line.name}</td>
                <td>Rs {line.price.toFixed(2)}</td>
                <td style={{ maxWidth: 120 }}>
                  <input
                    type="number"
                    min={1}
                    className="form-control form-control-sm"
                    value={line.quantity}
                    onChange={(e) =>
                      updateQuantity(line.productId, Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </td>
                <td>Rs {(line.price * line.quantity).toFixed(2)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeItem(line.productId)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">
        <p className="h5 mb-0">
          Total: <strong>Rs {cartTotal.toFixed(2)}</strong>
        </p>
        <div className="d-flex gap-2">
          <Link to="/" className="btn btn-outline-secondary">
            Continue shopping
          </Link>
          <Link to="/checkout" className="btn btn-dark">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
