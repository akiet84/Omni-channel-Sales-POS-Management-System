# 06: POS Customer Lookup and History Tracking

**What to build:** Tính năng tra cứu và quản lý khách hàng theo Số điện thoại trên màn hình POS. Thu ngân chỉ cần gõ một phần số điện thoại để tìm kiếm nhanh khách cũ hoặc bấm thêm mới nhanh khách hàng mà không làm ngắt quãng giỏ hàng. Đơn hàng hoàn tất sẽ tự động liên kết với hồ sơ khách hàng, cho phép thu ngân và chủ shop xem lại toàn bộ lịch sử mua hàng phục vụ chăm sóc và bảo hành.

**Blocked by:** 03 (POS Cash Checkout and Row Lock Deduction)

**Status:** ready-for-agent

- [ ] Thu ngân gõ số điện thoại vào ô tìm kiếm khách hàng trên màn hình POS; hiển thị gợi ý thông tin khách hàng nếu đã tồn tại.
- [ ] Nếu số điện thoại chưa có trong hệ thống, cho phép nhập nhanh tên khách hàng để tạo hồ sơ ngay trên màn hình bán hàng.
- [ ] Đơn hàng sau khi thanh toán được liên kết trường `customerId`.
- [ ] Giao diện cho phép xem nhanh tab "Lịch sử mua hàng" của khách, hiển thị danh sách các đơn đã mua, ngày mua và tổng chi tiêu.
- [ ] Viết test tích hợp xác nhận quy trình tìm kiếm khách hàng bằng SĐT, tạo khách hàng mới khi checkout và truy vấn lịch sử đơn hàng.
