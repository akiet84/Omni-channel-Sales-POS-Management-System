import { useState, useEffect, useRef } from 'react';
import type { SKU } from '@omni-sales/shared-types';
import {
  calculateLineTotal,
  calculateCartTotals,
  canAddOrIncrement,
  type CartItem,
  type Discount,
  type DiscountType,
} from '../domain/cart';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Percent,
  DollarSign,
  ShoppingCart,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

interface POSScreenProps {
  skus: SKU[];
  onCheckoutComplete?: () => void;
}

export function POSScreen({ skus }: POSScreenProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderDiscount, setOrderDiscount] = useState<Discount>({ type: 'FIXED', value: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart calculations
  const totals = calculateCartTotals(cart, orderDiscount, 0.10);

  // Filter SKU suggestions
  const suggestions = searchQuery.trim()
    ? skus.filter(
        (s) =>
          s.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleAddItemToCart = (sku: SKU) => {
    const available = sku.inventory?.available ?? 0;
    if (available <= 0) {
      alert(`Sản phẩm "${sku.name}" (${sku.skuCode}) đã hết hàng khả dụng.`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.sku.id === sku.id);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        if (!canAddOrIncrement(item, 1)) {
          alert(`Không thể thêm. Tồn khả dụng của SKU ${sku.skuCode} là ${available}.`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...item, quantity: item.quantity + 1 };
        return updated;
      }
      return [...prev, { sku, quantity: 1 }];
    });

    setSearchQuery('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return;

      // Exact match on barcode or skuCode first
      const exactMatch = skus.find(
        (s) => s.barcode.toLowerCase() === query || s.skuCode.toLowerCase() === query
      );

      if (exactMatch) {
        handleAddItemToCart(exactMatch);
      } else if (suggestions.length === 1) {
        handleAddItemToCart(suggestions[0]);
      }
    }
  };

  const updateQuantity = (skuId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.sku.id !== skuId) return item;
          if (delta < 0 && item.quantity <= 1) return item;
          if (delta > 0 && !canAddOrIncrement(item, delta)) {
            alert(
              `Đã đạt giới hạn tồn khả dụng (${item.sku.inventory?.available ?? 0}) cho SKU ${item.sku.skuCode}.`
            );
            return item;
          }
          return { ...item, quantity: item.quantity + delta };
        })
        .filter(Boolean)
    );
  };

  const setItemQuantity = (skuId: string, quantity: number) => {
    if (quantity <= 0) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.sku.id !== skuId) return item;
        const available = item.sku.inventory?.available ?? 0;
        if (quantity > available) {
          alert(`Số lượng vượt quá tồn khả dụng (${available}) của SKU ${item.sku.skuCode}.`);
          return { ...item, quantity: available };
        }
        return { ...item, quantity };
      })
    );
  };

  const updateLineDiscount = (skuId: string, discount: Discount | undefined) => {
    setCart((prev) =>
      prev.map((item) => (item.sku.id === skuId ? { ...item, discount } : item))
    );
  };

  const removeFromCart = (skuId: string) => {
    setCart((prev) => prev.filter((item) => item.sku.id !== skuId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng (F8)?')) {
      setCart([]);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống! Hãy thêm sản phẩm trước khi thanh toán.');
      return;
    }
    alert(
      `Tiến hành thanh toán hóa đơn:\nTổng tiền: ${totals.totalPayable.toLocaleString('vi-VN')} đ`
    );
  };

  // Keyboard shortcut listener: F2 (search), F8 (clear cart), F9 (checkout)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'F8') {
        e.preventDefault();
        clearCart();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
      {/* Left panel: Search & Cart Table */}
      <div>
        {/* Barcode & Search Box */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Barcode size={22} color="#3b82f6" style={{ marginRight: '0.5rem' }} />
            <Search size={18} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Quét mã vạch barcode hoặc nhập mã SKU/tên sản phẩm... (Phím F2)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearchKeyDown}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#9ca3af',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                maxHeight: '280px',
                overflowY: 'auto',
                zIndex: 10,
              }}
            >
              {suggestions.map((sku) => {
                const available = sku.inventory?.available ?? 0;
                const outOfStock = available <= 0;
                return (
                  <div
                    key={sku.id}
                    onClick={() => handleAddItemToCart(sku)}
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: outOfStock ? 'not-allowed' : 'pointer',
                      opacity: outOfStock ? 0.6 : 1,
                      backgroundColor: '#fff',
                    }}
                    onMouseEnter={(e) => {
                      if (!outOfStock) e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827' }}>
                        {sku.name} ({sku.skuCode})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        Barcode: {sku.barcode} | Phân loại:{' '}
                        {Object.entries(sku.variantAttributes || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ') || 'Tiêu chuẩn'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: '#1d4ed8' }}>
                        {sku.price.toLocaleString('vi-VN')} đ
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: outOfStock ? '#fee2e2' : '#dcfce7',
                          color: outOfStock ? '#b91c1c' : '#15803d',
                          fontWeight: 500,
                        }}
                      >
                        Khả dụng: {available}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Item Table */}
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShoppingCart size={18} />
            <span>Giỏ hàng thu ngân ({cart.length} mặt hàng)</span>
          </div>

          {cart.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
              <ShoppingCart size={40} style={{ margin: '0 auto 1rem', display: 'block' }} />
              Chưa có sản phẩm nào trong giỏ hàng. Quét mã vạch hoặc tìm kiếm để thêm.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', fontSize: '0.875rem' }}>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Sản phẩm</th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '120px' }}>Đơn giá</th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '140px' }}>Số lượng</th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '180px' }}>Giảm giá dòng</th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '120px', textAlign: 'right' }}>
                    Thành tiền
                  </th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const line = calculateLineTotal(item);
                  const available = item.sku.inventory?.available ?? 0;
                  return (
                    <tr key={item.sku.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{item.sku.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          SKU: {item.sku.skuCode} | Kho khả dụng: {available}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#374151' }}>
                        {item.sku.price.toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            onClick={() => updateQuantity(item.sku.id, -1)}
                            disabled={item.quantity <= 1}
                            style={{
                              padding: '0.25rem 0.4rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              background: '#fff',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={available}
                            value={item.quantity}
                            onChange={(e) =>
                              setItemQuantity(item.sku.id, parseInt(e.target.value, 10) || 1)
                            }
                            style={{
                              width: '45px',
                              textAlign: 'center',
                              padding: '0.2rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                            }}
                          />
                          <button
                            onClick={() => updateQuantity(item.sku.id, 1)}
                            disabled={item.quantity >= available}
                            style={{
                              padding: '0.25rem 0.4rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              background: '#fff',
                              cursor: item.quantity >= available ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <select
                            value={item.discount?.type ?? 'FIXED'}
                            onChange={(e) =>
                              updateLineDiscount(item.sku.id, {
                                type: e.target.value as DiscountType,
                                value: item.discount?.value ?? 0,
                              })
                            }
                            style={{
                              padding: '0.2rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                            }}
                          >
                            <option value="PERCENTAGE">%</option>
                            <option value="FIXED">đ</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={item.discount?.value ?? ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateLineDiscount(item.sku.id, {
                                type: item.discount?.type ?? 'FIXED',
                                value: val,
                              });
                            }}
                            style={{
                              width: '80px',
                              padding: '0.2rem 0.4rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                        {line.finalTotal.toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => removeFromCart(item.sku.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right panel: Order Summary & Checkout */}
      <div>
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#111827' }}>
            Thông tin thanh toán
          </h3>

          {/* Subtotal */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              color: '#4b5563',
            }}
          >
            <span>Tổng tiền hàng:</span>
            <span>{totals.rawSubtotal.toLocaleString('vi-VN')} đ</span>
          </div>

          {/* Line discount total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              color: '#dc2626',
            }}
          >
            <span>Giảm giá từng món:</span>
            <span>-{totals.lineDiscountTotal.toLocaleString('vi-VN')} đ</span>
          </div>

          {/* Order discount control */}
          <div style={{ margin: '1rem 0', borderTop: '1px dashed #e5e7eb', paddingTop: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.35rem',
              }}
            >
              Chiết khấu tổng đơn hàng:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                <button
                  type="button"
                  onClick={() => setOrderDiscount((prev) => ({ ...prev, type: 'PERCENTAGE' }))}
                  style={{
                    padding: '0.3rem 0.6rem',
                    border: 'none',
                    background: orderDiscount.type === 'PERCENTAGE' ? '#3b82f6' : '#fff',
                    color: orderDiscount.type === 'PERCENTAGE' ? '#fff' : '#374151',
                    cursor: 'pointer',
                  }}
                >
                  <Percent size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setOrderDiscount((prev) => ({ ...prev, type: 'FIXED' }))}
                  style={{
                    padding: '0.3rem 0.6rem',
                    border: 'none',
                    background: orderDiscount.type === 'FIXED' ? '#3b82f6' : '#fff',
                    color: orderDiscount.type === 'FIXED' ? '#fff' : '#374151',
                    cursor: 'pointer',
                  }}
                >
                  <DollarSign size={14} />
                </button>
              </div>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={orderDiscount.value || ''}
                onChange={(e) =>
                  setOrderDiscount((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value) || 0,
                  }))
                }
                style={{
                  flex: 1,
                  padding: '0.3rem 0.6rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          {/* Taxable and VAT */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              color: '#4b5563',
            }}
          >
            <span>Thuế VAT (10%):</span>
            <span>+{totals.vatAmount.toLocaleString('vi-VN')} đ</span>
          </div>

          <div
            style={{
              borderTop: '2px solid #e5e7eb',
              margin: '1rem 0',
              paddingTop: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>
              Khách phải trả:
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2563eb' }}>
              {totals.totalPayable.toLocaleString('vi-VN')} đ
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: cart.length === 0 ? '#93c5fd' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <CreditCard size={18} />
              <span>Thanh toán (F9)</span>
            </button>

            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              style={{
                width: '100%',
                padding: '0.65rem',
                backgroundColor: '#fff',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <RotateCcw size={16} />
              <span>Xóa giỏ hàng (F8)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
