import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()

  if (loading) {
    return (
      <div className="container text-center py-5" style={{ paddingTop: '140px' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />
  }

  return children
}

export function CustomerRoute({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()

  if (loading) {
    return (
      <div className="container text-center py-5" style={{ paddingTop: '140px' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    )
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (!user || user.role !== 'user') {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }

  return children
}
