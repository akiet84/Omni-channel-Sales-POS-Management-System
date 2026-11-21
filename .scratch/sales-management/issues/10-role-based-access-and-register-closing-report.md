# 10: Role-Based Access and Register Closing Report

**What to build:** Phân quyền người dùng bảo mật giữa Thu ngân (`Cashier`) và Quản trị viên (`Administrator`), kết hợp báo cáo bán hàng tổng hợp theo kênh và quy trình chốt ca bán hàng (Register Closing / Cash Reconciliation) cuối ngày. Thu ngân chỉ thấy giao diện bán hàng tại quầy, hoàn toàn bị ẩn giá vốn và báo cáo tài chính; Quản trị viên xem được biểu đồ doanh thu theo từng kênh bán (POS vs Shopee vs TikTok Shop) và thực hiện đối soát tiền mặt trong két vào cuối ngày.

**Blocked by:** 03 (POS Cash Checkout and Row Lock Deduction), 08 (Split Inventory and Marketplace Ingestion Queue)

**Status:** ready-for-agent

- [ ] Phân quyền dựa trên JWT token và vai trò (`Cashier` vs `Administrator`). Chặn quyền truy cập các endpoint doanh thu và giá vốn đối với vai trò `Cashier`.
- [ ] Giao diện Admin Dashboard hiển thị biểu đồ và bảng số liệu doanh thu phân nhóm theo kênh bán (`Sales Channel`) theo ngày, tuần, tháng.
- [ ] Chức năng "Chốt ca bán hàng" (Register Closing) cho thu ngân: nhập số tiền mặt thực tế kiểm đếm trong két khi kết thúc ca làm việc.
- [ ] Hệ thống tự động so khớp số tiền thực tế với tổng tiền mặt ghi nhận từ các đơn POS trong ca, tính toán chênh lệch (thừa/thiếu tiền) và in phiếu chốt ca.
- [ ] Cho phép Administrator xem danh sách lịch sử các phiên ca làm việc và lý do giải trình nếu phát hiện chênh lệch tiền mặt.
- [ ] Viết test tự động xác nhận cơ chế kiểm tra quyền (RBAC) chặn quyền xem báo cáo của `Cashier` và tính toán chính xác số liệu đối soát tiền chốt ca.
