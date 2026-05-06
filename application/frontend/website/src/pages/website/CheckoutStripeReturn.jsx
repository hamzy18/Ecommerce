import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { completeStripeOrder } from '../../api/apiPayment'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function CheckoutStripeReturn() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    const sessionId = params.get('session_id')
    if (!sessionId) {
      setError('Missing payment session. Return to checkout and try again.')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        await completeStripeOrder(sessionId)
        if (cancelled) return
        clearCart()
        const notice = 'Order paid with Stripe. Thank you!'
        if (user?.role === 'admin') {
          navigate('/orders-dashboard', { replace: true, state: { notice } })
        } else if (user?.role === 'user') {
          navigate('/account', { replace: true, state: { notice } })
        } else {
          navigate('/', { replace: true, state: { notice } })
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Payment could not be confirmed.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params, navigate, clearCart, user?.role, authLoading])

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
      {error ? (
        <>
          <div className="alert alert-danger">{error}</div>
          <Link to="/checkout">Back to checkout</Link>
        </>
      ) : (
        <p className="text-muted">Confirming your payment…</p>
      )}
    </div>
  )
}
