import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getProducts } from '../../../api/apiProduct'

const LOW_STOCK_THRESHOLD = 10

export default function ProductTable() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts({})
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    setDeletingId(id)
    try {
      await deleteProduct(id)
      await load()
    } catch (e) {
      alert(e.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const lowStock = products.filter(
    (p) => Number(p.quantity) > 0 && Number(p.quantity) <= LOW_STOCK_THRESHOLD
  ).length
  const outOfStock = products.filter((p) => Number(p.quantity) <= 0).length

  return (
    <div className="container mt-5" style={{ paddingTop: '80px', paddingBottom: '48px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="mb-0">Product management & stock</h3>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={load}>
            Refresh
          </button>
          <Link to="/add-product" className="btn btn-success">
            + Add product
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && (lowStock > 0 || outOfStock > 0) && (
        <div className="alert alert-warning py-2 small mb-3">
          Stock alerts:{' '}
          {outOfStock > 0 && (
            <strong>
              {outOfStock} out of stock
              {lowStock > 0 ? '; ' : '.'}
            </strong>
          )}
          {lowStock > 0 && (
            <strong>
              {lowStock} at or below {LOW_STOCK_THRESHOLD} units (restock soon).
            </strong>
          )}
        </div>
      )}
      {loading && <p className="text-muted">Loading…</p>}

      {!loading && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark text-center">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock (qty)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted py-4">
                    No products yet.
                  </td>
                </tr>
              )}
              {products.map((p, index) => (
                <tr key={p._id}>
                  <td>{index + 1}</td>
                  <td className="text-start">{p.productName}</td>
                  <td>{p.category || '—'}</td>
                  <td>Rs {Number(p.productPrice || 0).toFixed(2)}</td>
                  <td>
                    <span
                      className={
                        Number(p.quantity) <= 0
                          ? 'badge bg-danger'
                          : Number(p.quantity) <= LOW_STOCK_THRESHOLD
                            ? 'badge bg-warning text-dark'
                            : ''
                      }
                    >
                      {p.quantity ?? 0}
                    </span>
                    {Number(p.quantity) <= LOW_STOCK_THRESHOLD && Number(p.quantity) > 0 && (
                      <span className="small text-muted d-block mt-1">Low stock</span>
                    )}
                    {Number(p.quantity) <= 0 && (
                      <span className="small text-muted d-block mt-1">Restock required</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${p.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}
                    >
                      {p.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/edit-product/${p._id}`} className="btn btn-sm btn-primary me-1">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      disabled={deletingId === p._id}
                      onClick={() => handleDelete(p._id)}
                    >
                      {deletingId === p._id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
