import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../../component/AuthLayout'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { adminLogin, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (user?.role === 'admin') navigate(from, { replace: true })
  }, [authLoading, user, from, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await adminLogin(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Administrator sign in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Administrator sign in"
      subtitle="Restricted area — store managers and staff only."
    >
      <div className="card shadow-sm border-0 border-top border-dark border-3">
        <div className="card-body p-4 p-md-5">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Admin email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 btn-lg" disabled={busy || authLoading}>
              {busy ? 'Signing in…' : 'Sign in to admin'}
            </button>
          </form>
          <hr className="my-4" />
          <p className="text-center small mb-0">
            <Link to="/login" className="text-muted">
              ← Customer sign in
            </Link>
            {' · '}
            <Link to="/" className="text-muted">
              Back to store
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
