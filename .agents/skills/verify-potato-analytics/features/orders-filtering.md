# Orders Table & Filtering

The Orders Table presents transactional activity with instant client-side search and status-based filtering.

## Sub-features

- `table-render` displays Order ID, Customer Name, Email, Product, Date, Amount, and Status Badge.
- `search-filter` filters rows in real time by customer name, order ID, product, or email.
- `status-filter` restricts the displayed orders by status (`All`, `Completed`, `Pending`, `Cancelled`).
- `empty-state` shows a clear message when no orders match the filter criteria.

## How to get to it (user POV)

- Scroll to the bottom section of the dashboard ("Giao Dịch Gần Đây").
- Type a keyword into the global search input in the navbar (`Tìm kiếm giao dịch, khách hàng...`).
- Select an option from the status dropdown above the table (`Tất cả trạng thái`, `Hoàn thành`, `Đang xử lý`, `Đã hủy`).

## Driving it with Playwright

Preconditions:
- Dashboard loaded at `/`.

1. **Search Customer:**
   ```ts
   await page.getByTestId('global-search-input').fill('Nguyễn Văn An')
   await expect(page.getByTestId('order-row-ORD-1001')).toBeVisible()
   await expect(page.getByTestId('order-row-ORD-1002')).toHaveCount(0)
   ```
2. **Clear Search:**
   ```ts
   await page.getByTestId('global-search-input').fill('')
   ```
3. **Filter by Status:**
   ```ts
   await page.getByTestId('filter-status-select').selectOption('Cancelled')
   await expect(page.getByTestId('order-row-ORD-1005')).toBeVisible()
   await expect(page.getByTestId('order-row-ORD-1001')).toHaveCount(0)
   ```

## Gotchas

- Search is case-insensitive.
- Combining a search term and an exclusive status filter tests the conjunction (AND) of both criteria.
