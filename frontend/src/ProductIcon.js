import React from 'react';

// Tiny line-icon set, picked by keyword match against the product name.
// Falls back to a generic box icon for anything unrecognized.
function ProductIcon({ name = '' }) {
  const n = name.toLowerCase();

  if (n.includes('mouse')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="product-icon">
        <rect x="7" y="3" width="10" height="18" rx="5" />
        <line x1="12" y1="3" x2="12" y2="10" />
      </svg>
    );
  }
  if (n.includes('keyboard')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="product-icon">
        <rect x="2" y="6" width="20" height="12" rx="1.5" />
        <line x1="5" y1="10" x2="5" y2="10.2" />
        <line x1="9" y1="10" x2="9" y2="10.2" />
        <line x1="13" y1="10" x2="13" y2="10.2" />
        <line x1="17" y1="10" x2="17" y2="10.2" />
        <line x1="6" y1="14.5" x2="18" y2="14.5" />
      </svg>
    );
  }
  if (n.includes('hub') || n.includes('usb')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="product-icon">
        <rect x="3" y="8" width="18" height="8" rx="1.5" />
        <line x1="7" y1="16" x2="7" y2="20" />
        <line x1="12" y1="16" x2="12" y2="20" />
        <line x1="17" y1="16" x2="17" y2="20" />
      </svg>
    );
  }
  if (n.includes('stand')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="product-icon">
        <rect x="4" y="4" width="16" height="9" rx="1" />
        <path d="M8 18 L12 13 L16 18" />
        <line x1="6" y1="20" x2="18" y2="20" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="product-icon">
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <line x1="12" y1="11" x2="12" y2="21" />
    </svg>
  );
}

export default ProductIcon;
