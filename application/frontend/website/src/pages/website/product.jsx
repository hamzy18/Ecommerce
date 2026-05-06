import { useEffect, useMemo, useState } from 'react'
import ProductItem from '../../component/productitem'
import { useProducts } from '../../hook/Producthook'

export default function Product() {
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const { products: allProducts, loading, error } = useProducts({
    status: 'active',
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
  })

  const displayed = useMemo(() => {
    if (!category) return allProducts
    return allProducts.filter((p) => p.category === category)
  }, [allProducts, category])

  const categories = useMemo(() => {
    const set = new Set()
    allProducts.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set).sort()
  }, [allProducts])

  return (
    <>
      <div className="main-banner" id="top" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-heading text-center">
                <h2>Our Latest Products</h2>
                <span>Shop electronics, fashion, and more.</span>
              </div>
              <div className="row justify-content-center mb-4 g-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted">Search products</label>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Name or description…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Filter by category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section" id="products">
        <div className="container">
          <div className="row">
            {loading && (
              <div className="col-12 text-center py-5">
                <p className="text-muted">Loading products…</p>
              </div>
            )}
            {error && (
              <div className="col-12">
                <div className="alert alert-danger" role="alert">
                  {error} — ensure the API is running on port 5000.
                </div>
              </div>
            )}
            {!loading && !error && displayed.length === 0 && (
              <div className="col-12 text-center py-5">
                <p className="text-muted">No products yet. Add some from the admin panel.</p>
              </div>
            )}
            {!loading &&
              displayed.map((p) => (
                <ProductItem key={p._id} product={p} />
              ))}
          </div>
        </div>
      </section>
    </>
  )
}
