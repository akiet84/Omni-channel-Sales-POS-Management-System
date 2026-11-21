# 03: POS Cash Checkout and Row Lock Deduction

**What to build:** Luồng thanh toán Tiền mặt tại quầy với tính năng tự động tính tiền thối. Khi bấm thanh toán, yêu cầu gửi về backend thực thi giao dịch cơ sở dữ liệu có khóa dòng (Row-level lock qua `SELECT ... FOR UPDATE` trên PostgreSQL), kiểm tra số lượng khả dụng, trừ thẳng vào `On-hand Inventory`, tạo bản ghi `Order` với trạng thái `Completed`, và trả về thông tin đơn hàng thành công; nếu tồn kho không đủ, giao dịch rollback an toàn và hiển thị cảnh báo lỗi chi tiết.

**Blocked by:** 02 (POS Barcode Search and Cart Calculation)

**Status:** ready-for-agent

- [ ] Thu ngân chọn phương thức "Tiền mặt", nhập số tiền khách đưa, giao diện tự động hiển thị tiền thừa cần thối.
- [ ] Bấm xác nhận thanh toán (hoặc phím tắt `Enter`), gửi API request `POST /api/orders/checkout`.
- [ ] Backend mở database transaction, khóa dòng bản ghi tồn kho của các SKU trong giỏ hàng để ngăn chặn tranh chấp đồng thời (race conditions).
- [ ] Kiểm tra điều kiện `available >= quantity`; nếu thỏa mãn thì trừ trực tiếp `onHand` và tạo `Order` với trạng thái `Completed`.
- [ ] Nếu có bất kỳ SKU nào không đủ số lượng, transaction rollback và trả về mã lỗi `INSUFFICIENT_STOCK` kèm danh sách SKU bị thiếu.
- [ ] Viết test tích hợp mô phỏng 2 giao dịch đồng thời cùng mua món hàng cuối cùng, xác nhận đúng 1 giao dịch thành công và 1 giao dịch bị từ chối an toàn.
