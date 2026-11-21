# Create New Order

Create New Order enables users to record a new transaction through a modal dialog with instant table updates.

## Sub-features

- `open-modal` opens the order creation modal.
- `close-modal` dismisses the modal without altering order state.
- `submit-order` validates input values, prepends the new order to the list, and closes the modal.

## How to get to it (user POV)

- Click the blue "Tạo đơn mới" button at the top right of the Orders Table.
- Fill in:
  - Tên khách hàng (Customer Name - required)
  - Email (optional)
  - Sản phẩm / Dịch vụ (Product - required)
  - Số tiền (Amount - required number)
  - Trạng thái (Status - Completed, Pending, or Cancelled)
- Click "Lưu đơn hàng".

## Driving it with Playwright

Preconditions:
- Dashboard loaded at `/`.

1. **Open Modal:**
   ```ts
   await page.getByTestId('btn-open-new-order').click()
   await expect(page.getByTestId('new-order-modal')).toBeVisible()
   ```
2. **Fill Form:**
   ```ts
   await page.getByTestId('input-customer').fill('Đặng Hoàng Long')
   await page.getByTestId('input-email').fill('long.dang@potato.ai')
   await page.getByTestId('input-product').fill('AI Agent Platform Enterprise')
   await page.getByTestId('input-amount').fill('2990')
   await page.getByTestId('select-status').selectOption('Completed')
   ```
3. **Submit:**
   ```ts
   await page.getByTestId('btn-submit-order').click()
   ```
4. **Confirm Persistence in View:**
   ```ts
   await expect(page.getByTestId('new-order-modal')).toHaveCount(0)
   await expect(page.getByText('Đặng Hoàng Long')).toBeVisible()
   await expect(page.getByText('AI Agent Platform Enterprise')).toBeVisible()
   await expect(page.getByText('$2,990')).toBeVisible()
   ```

## Gotchas

- Blank customer or product names are blocked by HTML5 form validation.
- The amount field requires a positive numeric value.
- Newly created orders are prepended to the top of the table.
