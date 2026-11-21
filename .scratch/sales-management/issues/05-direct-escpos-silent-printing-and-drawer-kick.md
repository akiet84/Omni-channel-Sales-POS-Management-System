# 05: Direct ESC/POS Silent Printing and Drawer Kick

**What to build:** Xây dựng module in hóa đơn trực tiếp (Direct Printing) không qua hộp thoại trình duyệt bằng cách phát lệnh mã máy ESC/POS qua Web Serial API hoặc WebUSB tới máy in nhiệt khổ K80 (80mm). Ngay khi đơn hàng hoàn tất, máy in tự động in biên lai sắc nét, thực hiện lệnh cắt giấy tự động (`GS V 0`) và phát xung điện mở két đựng tiền mặt RJ11 (`ESC p 0 25 250`).

**Blocked by:** 03 (POS Cash Checkout and Row Lock Deduction)

**Status:** ready-for-agent

- [ ] Cung cấp giao diện cài đặt máy in trong phần cấu hình POS, cho phép thu ngân kết nối cổng Web Serial / WebUSB tới máy in nhiệt.
- [ ] Module mã hóa ESC/POS (pure encoder) chuyển đổi đối tượng `Order` thành chuỗi byte nhị phân chuẩn K80 (tiêu đề cửa hàng, ngày giờ, danh sách món, tiền khách đưa, tiền thừa, mã vạch đơn hàng).
- [ ] Lệnh in được bắn thẳng xuống máy in trong vòng dưới 0.5 giây sau khi bấm thanh toán, hoàn toàn không bật hộp thoại `window.print()` của trình duyệt.
- [ ] Tự động gửi lệnh cắt giấy một phần hoặc toàn phần sau khi in xong.
- [ ] Nếu phương thức thanh toán là Tiền mặt, tự động gửi xung điện mở két tiền qua cổng RJ11 của máy in.
- [ ] Viết unit test xác thực bộ sinh byte ESC/POS tạo ra đúng các chuỗi mã điều khiển (bold, alignment, barcode, drawer kick, cut).
