import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './component/Layout'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { AdminRoute, CustomerRoute } from './component/ProtectedRoute'
import Product from './pages/website/product'
import ProductDetail from './pages/website/ProductDetail'
import Cart from './pages/website/Cart'
import Checkout from './pages/website/Checkout'
import Form from './component/form'
import ProductTable from './pages/dashboard/product/productDashboard'
import OrdersDashboard from './pages/dashboard/OrdersDashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLogin from './pages/auth/AdminLogin'
import Account from './pages/account/Account'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import CheckoutStripeReturn from './pages/website/CheckoutStripeReturn'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Product />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/stripe-return" element={<CheckoutStripeReturn />} />

            <Route
              path="/account"
              element={
                <CustomerRoute>
                  <Account />
                </CustomerRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/add-product"
              element={
                <AdminRoute>
                  <Form />
                </AdminRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <AdminRoute>
                  <Form />
                </AdminRoute>
              }
            />
            <Route
              path="/product-dashboard"
              element={
                <AdminRoute>
                  <ProductTable />
                </AdminRoute>
              }
            />
            <Route
              path="/orders-dashboard"
              element={
                <AdminRoute>
                  <OrdersDashboard />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
