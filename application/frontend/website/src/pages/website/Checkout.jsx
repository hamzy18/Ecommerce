import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder } from '../../api/apiOrder'
import { createStripeCheckoutSession, fetchStripeStatus } from '../../api/apiPayment'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [demoPaymentDone, setDemoPaymentDone] = useState(false)
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [stripeStarting, setStripeStarting] = useState(false)

  useEffect(() => {
    if (user?.role === 'user') {
      setForm((f) => ({
        ...f,
        customerName: user.name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  useEffect(() => {
    setDemoPaymentDone(false)
  }, [items])

  useEffect(() => {
    fetchStripeStatus().then((s) => setStripeEnabled(!!s.enabled))
  }, [])

  function shippingErrors() {
    if (!form.customerName.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (!form.address.trim()) return 'Shipping address is required.'
    if (items.length === 0) return 'Your cart is empty.'
    return null
  }

  async function startStripeCheckout() {
    setMessage(null)
    const err = shippingErrors()
    if (err) {
      setMessage(err)
      return
    }
    setStripeStarting(true)
    try {
      const { url } = await createStripeCheckoutSession({
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        items: items.map((l) => ({
          productId: l.productId,
          name: l.name,
          price: l.price,
          quantity: l.quantity,
          image: l.image,
        })),
      })
      if (url) window.location.href = url
      else setMessage('Stripe did not return a checkout URL.')
    } catch (e) {
      setMessage(e.message || 'Could not start Stripe.')
    } finally {
      setStripeStarting(false)
    }
  }

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    if (items.length === 0) {
      setMessage('Your cart is empty.')
      return
    }
    if (!demoPaymentDone) {
      setMessage('Use the JazzCash demo payment button below first (no real charge).')
      return
    }
    setSubmitting(true)
    try {
      await createOrder({
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        items: items.map((l) => ({
          productId: l.productId,
          name: l.name,
          price: l.price,
          quantity: l.quantity,
          image: l.image,
        })),
      })
      clearCart()
      const notice = 'Order placed successfully.'
      if (user?.role === 'admin') {
        navigate('/orders-dashboard', { state: { notice } })
      } else if (user?.role === 'user') {
        navigate('/account', { state: { notice } })
      } else {
        navigate('/', { state: { notice } })
      }
    } catch (err) {
      setMessage(err.message || 'Could not place order.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !message) {
    return (
      <div className="container" style={{ paddingTop: '140px' }}>
        <p className="text-muted">Nothing to checkout.</p>
        <Link to="/">Go shopping</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <h2 className="mb-4">Checkout</h2>
      <div className="row">
        <div className="col-lg-7">
          <form onSubmit={onSubmit} className="card shadow-sm border-0">
            <div className="card-body">
              {message && <div className="alert alert-danger">{message}</div>}
              <div className="mb-3">
                <label className="form-label">Full name</label>
                <input
                  name="customerName"
                  className="form-control"
                  required
                  value={form.customerName}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  className="form-control"
                  required
                  value={form.email}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  name="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Shipping address</label>
                <textarea
                  name="address"
                  className="form-control"
                  rows={3}
                  required
                  value={form.address}
                  onChange={onChange}
                />
              </div>
              <div className="border rounded p-3 mb-3 bg-white">
                <h6 className="mb-2">Payment</h6>
                {stripeEnabled && (
                  <div className="mb-3">
                    <p className="small text-muted mb-2">
                      Pay securely with Stripe (test mode). Fill shipping details above first.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={stripeStarting}
                      onClick={startStripeCheckout}
                    >
                      {stripeStarting ? 'Redirecting…' : `Pay with Stripe · Rs ${cartTotal.toFixed(2)}`}
                    </button>
                  </div>
                )}
                <p className="small text-muted mb-2">
                  {stripeEnabled
                    ? 'Or use JazzCash demo checkout (no real charge):'
                    : 'JazzCash demo checkout (add STRIPE_SECRET_KEY on the server to enable Stripe):'}
                </p>
                {demoPaymentDone ? (
                  <div className="alert alert-success py-2 mb-0 small">
                    JazzCash demo payment complete. You can place your order.
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setMessage(null)
                      setDemoPaymentDone(true)
                    }}
                  >
                    Pay Rs ${cartTotal.toFixed(2)} with JazzCash (demo)
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-dark"
                disabled={submitting || !demoPaymentDone}
              >
                {submitting ? 'Placing order…' : `Place order (JazzCash demo) · Rs ${cartTotal.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
        <div className="col-lg-5 mt-4 mt-lg-0">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <h5 className="card-title">Order summary</h5>
              <ul className="list-unstyled small mb-0">
                {items.map((l) => (
                  <li key={l.productId} className="d-flex justify-content-between py-1">
                    <span>
                      {l.name} × {l.quantity}
                    </span>
                    <span>Rs {(l.price * l.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>Rs {cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
