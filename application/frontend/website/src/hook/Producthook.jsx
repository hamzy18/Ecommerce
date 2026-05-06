import { useCallback, useEffect, useState } from 'react'
import * as apiProduct from '../api/apiProduct'

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    apiProduct
      .getProducts(filters)
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load products')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filters.category, filters.status, filters.q, refreshKey])

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { products, setProducts, loading, error, refetch }
}
