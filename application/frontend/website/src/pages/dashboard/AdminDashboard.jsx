import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="container mt-5" style={{ paddingTop: '80px', paddingBottom: '48px' }}>
      <h3 className="mb-4">Admin</h3>
      <p className="text-muted mb-4">Manage catalog, inventory, and customer orders.</p>
      <div className="row g-3">
        <div className="col-md-6 col-lg-4">
          <Link to="/product-dashboard" className="text-decoration-none">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body">
                <h5 className="card-title">Products & stock</h5>
                <p className="card-text small text-muted mb-0">
                  Add, edit, delete products and monitor inventory levels.
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link to="/orders-dashboard" className="text-decoration-none">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body">
                <h5 className="card-title">Orders</h5>
                <p className="card-text small text-muted mb-0">
                  View orders and update fulfillment status.
                </p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link to="/add-product" className="text-decoration-none">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body">
                <h5 className="card-title">Add product</h5>
                <p className="card-text small text-muted mb-0">Create a new catalog listing.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
