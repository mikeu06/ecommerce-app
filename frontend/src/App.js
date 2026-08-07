import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import ProductIcon from './ProductIcon';

const API_BASE_URL =
  (window._env_ && window._env_.API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080';

// Deterministic short "SKU" tag generated from product id + name,
// purely cosmetic -- gives each card a parts-catalog feel.
function skuFor(product) {
  const initials = product.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  return `${initials}-${String(product.id).padStart(3, '0')}`;
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [justAdded, setJustAdded] = useState(null);

  const loadProducts = useCallback(() => {
    return fetch(`${API_BASE_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`API responded with ${res.status}`);
        return res.json();
      })
      .then((data) => setProducts(data));
  }, []);

  const loadCart = useCallback(() => {
    return fetch(`${API_BASE_URL}/api/cart`)
      .then((res) => {
        if (!res.ok) throw new Error(`API responded with ${res.status}`);
        return res.json();
      })
      .then((data) => setCart(data));
  }, []);

  useEffect(() => {
    Promise.all([loadProducts(), loadCart()])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadProducts, loadCart]);

  const addToCart = (productId) => {
    fetch(`${API_BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCart(data);
        setJustAdded(productId);
        setTimeout(() => setJustAdded(null), 900);
      })
      .catch((err) => setError(err.message));
  };

  const updateQuantity = (itemId, quantity) => {
    fetch(`${API_BASE_URL}/api/cart/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
      .then((res) => res.json())
      .then((data) => setCart(data))
      .catch((err) => setError(err.message));
  };

  const removeFromCart = (itemId) => {
    fetch(`${API_BASE_URL}/api/cart/items/${itemId}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => setCart(data))
      .catch((err) => setError(err.message));
  };

  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

  return (
    <div className="catalog">
      <header className="catalog-header">
        <div>
          <h1 className="brand-mark">NODE &amp; WIRE</h1>
          <div className="brand-sub">Desk Hardware Catalog</div>
        </div>
        <button className="cart-toggle" onClick={() => setShowCart(true)}>
          Cart
          <span className="badge">{cartCount}</span>
        </button>
      </header>

      <div className="catalog-meta">
        <span>VOL. 01 — PERIPHERALS</span>
        <span>{todayStr}</span>
      </div>

      {loading && <div className="status-line">loading catalog...</div>}
      {error && (
        <div className="status-line error">
          could not reach backend api — {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid">
          {products.map((p) => (
            <div className="product-card" key={p.id}>
              <span className="product-sku">{skuFor(p)}</span>
              <ProductIcon name={p.name} />
              <h3 className="product-name">{p.name}</h3>
              <div className="product-row">
                <span className="product-price">${Number(p.price).toFixed(2)}</span>
                <button
                  className={`add-btn ${justAdded === p.id ? 'added' : ''}`}
                  onClick={() => addToCart(p.id)}
                >
                  {justAdded === p.id ? 'Added ✓' : 'Add to cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCart && (
        <>
          <div className="drawer-overlay" onClick={() => setShowCart(false)} />
          <aside className="drawer">
            <div className="drawer-head">
              <h2>Order Slip</h2>
              <button className="drawer-close" onClick={() => setShowCart(false)} aria-label="Close cart">
                ×
              </button>
            </div>

            <div className="drawer-body">
              {cart.items.length === 0 && <p className="drawer-empty">No items logged yet.</p>}
              {cart.items.map((item) => (
                <div className="cart-line" key={item.id}>
                  <span className="cart-line-name">
                    {item.productName}
                    <span className="cart-line-unit">${item.price} / unit</span>
                  </span>
                  <div className="qty-stepper">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <span className="cart-line-subtotal">${item.subtotal.toFixed(2)}</span>
                  <button className="remove-x" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="drawer-foot">
              <div className="total-row">
                <span>Total due</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" disabled={cart.items.length === 0}>
                Checkout (demo)
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

export default App;
