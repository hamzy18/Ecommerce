import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'active text-dark fw-bold' : 'text-muted'}`

export default function Navbar() {
  const { cartCount } = useCart()
  const { user, isAdmin, isCustomer, logout } = useAuth()

  return (
    <header className="header-area header-sticky app-top-nav">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="main-nav d-flex flex-wrap align-items-center justify-content-between gap-3 py-2">
              <Link to="/" className="logo text-decoration-none">
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>HexaShop</span>
              </Link>
              <ul className="nav app-top-nav__links flex-wrap align-items-center gap-1 gap-lg-3 mb-0 ps-0">
                <li className="nav-item">
                  <NavLink to="/" end className={linkClass}>
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/cart" className={linkClass}>
                    Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                  </NavLink>
                </li>

                {isCustomer && (
                  <li className="nav-item">
                    <NavLink to="/account" className={linkClass}>
                      My account
                    </NavLink>
                  </li>
                )}

                {isAdmin && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/admin" className={linkClass}>
                        Admin
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/product-dashboard" className={linkClass}>
                        Products
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/orders-dashboard" className={linkClass}>
                        Orders
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/add-product" className={linkClass}>
                        Add product
                      </NavLink>
                    </li>
                  </>
                )}

                {!user && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/login" className={linkClass}>
                        Sign in
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/register" className={linkClass}>
                        Register
                      </NavLink>
                    </li>
                  </>
                )}

                {user && (
                  <li className="nav-item ms-lg-2 d-flex align-items-center">
                    <div className="nav-link app-top-nav__user small py-0 d-inline-flex flex-wrap align-items-center gap-2">
                      <span className="text-nowrap">
                        Hi, <strong>{user.name?.split(' ')[0] || 'there'}</strong>
                      </span>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-muted p-0 lh-1 text-decoration-none align-middle"
                        onClick={logout}
                      >
                        Sign out
                      </button>
                    </div>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
