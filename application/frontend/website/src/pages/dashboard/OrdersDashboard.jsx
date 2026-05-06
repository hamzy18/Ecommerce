import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getOrders, updateOrderStatus } from '../../api/apiOrder'

const STATUSES = ['pending', 'processing', 'shipped', 'completed']

export default function OrdersDashboard() {
  const location = useLocation()
  const notice = location.state?.notice
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onStatusChange(orderId, status) {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, status)
      await load()
    } catch (e) {
      alert(e.message || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="container mt-5" style={{ paddingTop: '80px', paddingBottom: '48px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="mb-0">Orders</h3>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={load}>
            Refresh
          </button>
          <Link to="/" className="btn btn-outline-dark btn-sm">
            Shop
          </Link>
        </div>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p className="text-muted">Loading…</p>}

      {!loading &&
        orders.map((order) => (
          <div key={order._id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                <div>
                  <strong>Order #{order._id}</strong>
                  <span className="text-muted ms-2 small">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : ''}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label className="small mb-0 text-muted">Status</label>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto' }}
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => onStatusChange(order._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mb-1 small">
                <strong>{order.customerName}</strong> · {order.email}
              </p>
              <p className="mb-2 small text-muted">{order.address}</p>
              <ul className="list-unstyled small mb-2">
                {order.items?.map((item, i) => (
                  <li key={i} className="d-flex justify-content-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>Rs {(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-0 fw-bold">Total: Rs {Number(order.total || 0).toFixed(2)}</p>
              {order.paymentStatus === 'paid' && order.paymentMethod === 'jazzcash' && (
                <p className="mb-0 small text-success mt-1">Paid (JazzCash demo)</p>
              )}
              {order.paymentStatus === 'paid' && order.paymentMethod === 'stripe' && (
                <p className="mb-0 small text-success mt-1">Paid (Stripe)</p>
              )}
            </div>
          </div>
        ))}

      {!loading && orders.length === 0 && !error && (
        <p className="text-muted">No orders yet.</p>
      )}
    </div>
  )
}
