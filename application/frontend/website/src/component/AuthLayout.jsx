import { Link } from 'react-router-dom'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #fff 40%)' }}
    >
      <header className="py-3 border-bottom bg-white">
        <div className="container">
          <Link to="/" className="text-decoration-none text-dark fw-bold fs-4">
            HexaShop
          </Link>
        </div>
      </header>
      <div className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-5">
              <div className="text-center mb-4">
                <h1 className="h3 fw-bold mb-2">{title}</h1>
                {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
      <footer className="py-4 text-center text-muted small border-top bg-white">
        © {new Date().getFullYear()} HexaShop
      </footer>
    </div>
  )
}
