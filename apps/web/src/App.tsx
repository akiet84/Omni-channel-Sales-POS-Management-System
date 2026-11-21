import { useState, useEffect } from 'react';
import type { SKU } from '@omni-sales/shared-types';
import { POSScreen } from './components/POSScreen';
import { ShoppingBag, Boxes } from 'lucide-react';

export function App() {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'pos' | 'inventory'>('pos');

  useEffect(() => {
    fetch('/api/skus')
      .then((res) => res.json())
      .then((data) => {
        setSkus(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header
        style={{
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Omni-channel POS System</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Quản lý bán hàng tại quầy &amp; Đồng bộ tồn kho sàn TMĐT thời gian thực
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f3f4f6', padding: '0.3rem', borderRadius: '8px' }}>
          <button
            onClick={() => setCurrentTab('pos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              backgroundColor: currentTab === 'pos' ? '#fff' : 'transparent',
              color: currentTab === 'pos' ? '#2563eb' : '#6b7280',
              boxShadow: currentTab === 'pos' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <ShoppingBag size={18} />
            Bán hàng POS
          </button>
          <button
            onClick={() => setCurrentTab('inventory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              backgroundColor: currentTab === 'inventory' ? '#fff' : 'transparent',
              color: currentTab === 'inventory' ? '#2563eb' : '#6b7280',
              boxShadow: currentTab === 'inventory' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Boxes size={18} />
            Quản lý tồn kho
          </button>
        </div>
      </header>

      <main>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>Đang nạp dữ liệu hệ thống...</p>
        ) : currentTab === 'pos' ? (
          <POSScreen skus={skus} />
        ) : (
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#374151' }}>
              Danh mục sản phẩm &amp; Tồn kho khả dụng
            </h2>
            {skus.length === 0 ? (
              <p>Chưa có sản phẩm nào. Hãy chạy script seed để nạp dữ liệu mẫu.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Mã SKU</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Barcode</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Tên SKU</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Giá bán</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Tồn thực tế (On-hand)</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', color: '#dc2626' }}>Tạm giữ sàn (Reserved)</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', color: '#16a34a' }}>Khả dụng (Available)</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.map((sku) => (
                    <tr key={sku.id}>
                      <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', fontWeight: 'bold' }}>
                        {sku.skuCode}
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{sku.barcode}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{sku.name}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                        {sku.price.toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                        {sku.inventory?.onHand ?? 0}
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', color: '#dc2626' }}>
                        {sku.inventory?.reserved ?? 0}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          color: '#16a34a',
                          fontWeight: 'bold',
                        }}
                      >
                        {sku.inventory?.available ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
