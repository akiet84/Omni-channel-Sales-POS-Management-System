import { useState, useEffect } from 'react';
import type { SKU } from '@omni-sales/shared-types';

export function App() {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#111827' }}>Omni-channel POS System</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
          Quản lý bán hàng tại quầy &amp; Đồng bộ tồn kho sàn TMĐT thời gian thực
        </p>
      </header>

      <main>
        <h2>Danh mục sản phẩm &amp; Tồn kho khả dụng</h2>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : skus.length === 0 ? (
          <p>Chưa có sản phẩm nào. Hãy chạy script seed để nạp dữ liệu mẫu.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Mã SKU</th>
                <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Barcode</th>
                <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Tên SKU</th>
                <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Giá bán</th>
                <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Tồn thực tế (On-hand)</th>
                <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Tạm giữ sàn (Reserved)</th>
                <th style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>Khả dụng (Available)</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((sku) => (
                <tr key={sku.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', fontWeight: 'bold' }}>{sku.skuCode}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{sku.barcode}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{sku.name}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{sku.price.toLocaleString('vi-VN')} đ</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>{sku.inventory?.onHand ?? 0}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', color: '#dc2626' }}>
                    {sku.inventory?.reserved ?? 0}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', color: '#16a34a', fontWeight: 'bold' }}>
                    {sku.inventory?.available ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
