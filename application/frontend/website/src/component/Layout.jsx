import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid #eee' }}>
        <div className="container text-center text-muted small">
          <p className="mb-0">© {new Date().getFullYear()} HexaShop — demo store</p>
        </div>
      </footer>
    </>
  )
}
