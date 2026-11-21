import { useState, useRef } from 'react';
import {
  type SKU,
  type CartItem,
  type Discount,
  type DiscountType,
  calculateLineTotal,
  calculateCartTotals,
  canAddOrIncrement,
  getAvailableInventory,
} from '@omni-sales/shared-types';
import { usePOSHotkeys } from '../hooks/usePOSHotkeys';
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
  CheckCircle,
  X,
  Keyboard,
} from 'lucide-react';

interface POSScreenProps {
  skus: SKU[];
  onCheckoutComplete?: () => void;
}

export function POSScreen({ skus, onCheckoutComplete }: POSScreenProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderDiscount, setOrderDiscount] = useState<Discount>({ type: 'FIXED', value: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const totals = calculateCartTotals(cart, orderDiscount, 0.10);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const suggestions = trimmedQuery
    ? skus.filter(
        (s) =>
          s.barcode.toLowerCase().includes(trimmedQuery) ||
          s.skuCode.toLowerCase().includes(trimmedQuery) ||
          s.name.toLowerCase().includes(trimmedQuery)
      )
    : [];

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const handleAddItemToCart = (sku: SKU) => {
    const available = getAvailableInventory(sku);
    if (available <= 0) {
      triggerNotification(`Sản phẩm "${sku.name}" (${sku.skuCode}) đã hết hàng khả dụng.`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.sku.id === sku.id);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        if (!canAddOrIncrement(item, 1)) {
          triggerNotification(`Không thể thêm. Tồn khả dụng của SKU ${sku.skuCode} là ${available}.`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...item, quantity: item.quantity + 1 };
        setSelectedRowIndex(existingIndex);
        return updated;
      }
      setSelectedRowIndex(prev.length);
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

      const exactMatch = skus.find(
        (s) =>
          s.barcode.toLowerCase() === query ||
          s.skuCode.toLowerCase() === query ||
          s.name.toLowerCase() === query
      );

      if (exactMatch) {
        handleAddItemToCart(exactMatch);
      } else if (suggestions.length === 1) {
        handleAddItemToCart(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const updateQuantity = (skuId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.sku.id !== skuId) return item;
          if (delta < 0 && item.quantity <= 1) return item;
          if (delta > 0 && !canAddOrIncrement(item, delta)) {
            const available = getAvailableInventory(item.sku);
            triggerNotification(`Đã đạt giới hạn tồn khả dụng (${available}) cho SKU ${item.sku.skuCode}.`);
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
        const available = getAvailableInventory(item.sku);
        if (quantity > available) {
          triggerNotification(`Số lượng vượt quá tồn khả dụng (${available}) của SKU ${item.sku.skuCode}.`);
          return { ...item, quantity: Math.max(1, available) };
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
    setCart((prev) => {
      const filtered = prev.filter((item) => item.sku.id !== skuId);
      if (selectedRowIndex >= filtered.length) {
        setSelectedRowIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  const clearCart = () => {
    if (cart.length === 0 && (!orderDiscount.value || orderDiscount.value === 0)) return;
    setCart([]);
    setOrderDiscount({ type: 'FIXED', value: 0 });
    setSelectedRowIndex(0);
    triggerNotification('Đã làm trống giỏ hàng (F8)');
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      triggerNotification('Giỏ hàng trống! Hãy thêm sản phẩm trước khi thanh toán.');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckout = () => {
    setShowCheckoutModal(false);
    triggerNotification(`Đã xác nhận đơn hàng thành công! Tổng tiền: ${totals.totalPayable.toLocaleString('vi-VN')} đ`);
    setCart([]);
    setOrderDiscount({ type: 'FIXED', value: 0 });
    setSelectedRowIndex(0);
    if (onCheckoutComplete) {
      onCheckoutComplete();
    }
  };

  usePOSHotkeys({
    onF2: () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
    onF8: () => {
      clearCart();
    },
    onF9: () => {
      handleOpenCheckout();
    },
    onEscape: () => {
      if (showCheckoutModal) {
        setShowCheckoutModal(false);
      } else {
        setShowSuggestions(false);
      }
    },
    onArrowDown: () => {
      setSelectedRowIndex((prev) => Math.min(cart.length - 1, prev + 1));
    },
    onArrowUp: () => {
      setSelectedRowIndex((prev) => Math.max(0, prev - 1));
    },
    onIncrement: () => {
      const currentItem = cart[selectedRowIndex];
      if (currentItem) {
        updateQuantity(currentItem.sku.id, 1);
      }
    },
    onDecrement: () => {
      const currentItem = cart[selectedRowIndex];
      if (currentItem) {
        updateQuantity(currentItem.sku.id, -1);
      }
    },
    onDelete: () => {
      const currentItem = cart[selectedRowIndex];
      if (currentItem) {
        removeFromCart(currentItem.sku.id);
      }
    },
    hasItems: cart.length > 0,
  });

  return (
    <div>
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#1f2937',
            color: '#fff',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} color="#34d399" />
          <span>{notification}</span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          fontSize: '0.825rem',
          color: '#475569',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Keyboard size={15} />
          <kbd style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.1rem 0.35rem', fontWeight: 600 }}>F2</kbd> Tìm kiếm/Barcode
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <kbd style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.1rem 0.35rem', fontWeight: 600 }}>↑ / ↓</kbd> Chọn dòng giỏ hàng
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <kbd style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.1rem 0.35rem', fontWeight: 600 }}>← / →</kbd> Tăng/Giảm số lượng
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <kbd style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.1rem 0.35rem', fontWeight: 600 }}>F8</kbd> Xóa giỏ hàng
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <kbd style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.1rem 0.35rem', fontWeight: 600 }}>F9</kbd> Thanh toán đơn hàng
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
        <div>
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
                  const available = getAvailableInventory(sku);
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
                  {cart.map((item, index) => {
                    const line = calculateLineTotal(item);
                    const available = getAvailableInventory(item.sku);
                    const isSelected = index === selectedRowIndex;

                    return (
                      <tr
                        key={item.sku.id}
                        onClick={() => setSelectedRowIndex(index)}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                          transition: 'background-color 0.15s ease',
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, color: '#111827' }}>
                            {isSelected && <span style={{ color: '#2563eb', marginRight: '0.35rem' }}>▶</span>}
                            {item.sku.name}
                          </div>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.sku.id, -1);
                              }}
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
                              onClick={(e) => e.stopPropagation()}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.sku.id, 1);
                              }}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={(e) => e.stopPropagation()}>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(item.sku.id);
                            }}
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
              Thông tin đơn hàng
            </h3>

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleOpenCheckout}
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

      {showCheckoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCheckoutModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '500px',
              maxWidth: '90vw',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>
                Xác nhận thanh toán đơn hàng (F9)
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                <span>Tổng số mặt hàng:</span>
                <span style={{ fontWeight: 600 }}>{cart.length} mặt hàng</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                <span>Tổng tiền hàng:</span>
                <span>{totals.rawSubtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              {totals.lineDiscountTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#dc2626' }}>
                  <span>Tổng giảm giá theo dòng:</span>
                  <span>-{totals.lineDiscountTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              {totals.orderDiscountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#dc2626' }}>
                  <span>Chiết khấu tổng đơn:</span>
                  <span>-{totals.orderDiscountAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                <span>Thuế VAT (10%):</span>
                <span>+{totals.vatAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Khách phải thanh toán:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                {totals.totalPayable.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500,
                  color: '#374151',
                }}
              >
                Đóng (Esc)
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
