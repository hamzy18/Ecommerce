import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../component/AuthLayout'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (user?.role === 'user') navigate('/', { replace: true })
    if (user?.role === 'admin') navigate('/admin', { replace: true })
  }, [authLoading, user, navigate])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join HexaShop to track orders and check out faster."
    >
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Your name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 btn-lg" disabled={busy || authLoading}>
              {busy ? 'Creating account…' : 'Create your HexaShop account'}
            </button>
          </form>
          <p className="text-center small text-muted mt-4 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="fw-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
