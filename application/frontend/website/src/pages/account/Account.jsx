import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getMyOrders } from '../../api/apiOrder'
import { useAuth } from '../../context/AuthContext'

const statusClass = {
  pending: 'bg-secondary',
  processing: 'bg-info',
  shipped: 'bg-primary',
  completed: 'bg-success',
}

export default function Account() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const banner = location.state?.notice
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Could not load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      {banner && <div className="alert alert-success mb-4">{banner}</div>}
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Your account</h2>
              <p className="mb-1 fw-semibold">{user?.name}</p>
              <p className="text-muted small mb-4">{user?.email}</p>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Order history</h2>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={load}>
              Refresh
            </button>
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {loading && <p className="text-muted">Loading orders…</p>}
          {!loading && orders.length === 0 && !error && (
            <div className="card border-0 bg-light">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-3">You have not placed any orders yet.</p>
                <Link to="/" className="btn btn-dark btn-sm">
                  Start shopping
                </Link>
              </div>
            </div>
          )}
          {!loading &&
            orders.map((order) => (
              <div key={order._id} className="card mb-3 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                    <span className="fw-semibold">Order #{order._id.slice(-8)}</span>
                    <span
                      className={`badge ${statusClass[order.status] || 'bg-secondary'} align-self-start`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="small text-muted mb-2">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                  </p>
                  <ul className="list-unstyled small mb-2">
                    {order.items?.map((item, i) => (
                      <li key={i} className="d-flex justify-content-between py-1 border-bottom border-light">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>Rs {(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mb-0 fw-bold">Total: Rs {Number(order.total || 0).toFixed(2)}</p>
                  {order.paymentMethod === 'stripe' && order.paymentStatus === 'paid' && (
                    <p className="mb-0 small text-muted mt-1">Payment: Stripe</p>
                  )}
                  {order.paymentMethod === 'jazzcash' && order.paymentStatus === 'paid' && (
                    <p className="mb-0 small text-muted mt-1">Payment: JazzCash (demo)</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
