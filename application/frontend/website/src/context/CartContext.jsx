import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ecommerce_cart'

const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, qty = 1) => {
    const id = product._id || product.id
    const quantity = Math.max(1, Number(qty) || 1)
    const maxStock = product.quantity != null ? Number(product.quantity) : Infinity
    if (maxStock === 0) return
    setItems((prev) => {
      const idx = prev.findIndex((l) => l.productId === id)
      if (idx >= 0) {
        const next = [...prev]
        const combined = next[idx].quantity + quantity
        next[idx] = {
          ...next[idx],
          quantity: Math.min(combined, maxStock),
        }
        return next
      }
      return [
        ...prev,
        {
          productId: id,
          name: product.productName,
          price: Number(product.productPrice),
          quantity: Math.min(quantity, maxStock),
          image: product.productImage || '',
          stock: maxStock,
        },
      ]
    })
  }, [])

  const updateQuantity = useCallback((productId, qty) => {
    const q = Math.max(1, Number(qty) || 1)
    setItems((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? {
              ...line,
              quantity:
                line.stock != null && Number.isFinite(line.stock)
                  ? Math.min(q, line.stock)
                  : q,
            }
          : line
      )
    )
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((l) => l.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const cartCount = useMemo(
    () => items.reduce((n, l) => n + l.quantity, 0),
    [items]
  )

  const cartTotal = useMemo(
    () => items.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart, cartCount, cartTotal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
