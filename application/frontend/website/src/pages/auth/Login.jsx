import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../../component/AuthLayout'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (user?.role === 'user') navigate(from, { replace: true })
    if (user?.role === 'admin') navigate('/admin', { replace: true })
  }, [authLoading, user, from, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back. Use the email and password for your customer account."
    >
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 btn-lg" disabled={busy || authLoading}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <hr className="my-4" />
          <p className="text-center small text-muted mb-2">
            New to HexaShop?{' '}
            <Link to="/register" className="fw-semibold">
              Create an account
            </Link>
          </p>
          <p className="text-center small mb-0">
            <Link to="/admin/login" className="text-muted">
              Administrator sign-in →
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
