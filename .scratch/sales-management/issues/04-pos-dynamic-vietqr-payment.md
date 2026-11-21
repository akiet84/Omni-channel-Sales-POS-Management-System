# 04: POS Dynamic VietQR Payment

**What to build:** Tích hợp phương thức thanh toán chuyển khoản ngân hàng qua mã Dynamic VietQR tại quầy POS. Khi thu ngân chọn hình thức chuyển khoản, màn hình hiển thị mã QR động chuẩn NAPAS nhúng sẵn thông tin Ngân hàng, Số tài khoản, Số tiền chính xác của đơn hàng và Mã tham chiếu đơn hàng. Thu ngân xác nhận khi tiền vào tài khoản và hệ thống hoàn tất đơn hàng với phương thức thanh toán là `VIETQR`.

**Blocked by:** 03 (POS Cash Checkout and Row Lock Deduction)

**Status:** ready-for-agent

- [ ] Thu ngân chọn tab phương thức thanh toán "Chuyển khoản VietQR" trên modal thanh toán POS.
- [ ] Màn hình sinh mã QR động (theo đặc tả NAPAS VietQR) hiển thị rõ logo ngân hàng, số tài khoản nhận tiền, số tiền cần thanh toán và nội dung chuyển khoản là mã đơn hàng.
- [ ] Cho phép phóng to mã QR trên màn hình phụ hướng về phía khách hàng (customer-facing display) hoặc in nhanh mã QR tạm.
- [ ] Thu ngân bấm "Xác nhận đã nhận tiền" để hoàn tất đơn hàng và trừ tồn kho tương tự như luồng tiền mặt.
- [ ] Bản ghi `Order` lưu trường `paymentMethod: "VIETQR"` kèm mã giao dịch/nội dung chuyển khoản.
- [ ] Viết unit test xác nhận chuỗi payload VietQR được mã hóa đúng chuẩn EMVCo/NAPAS với số tiền và nội dung đơn hàng.
