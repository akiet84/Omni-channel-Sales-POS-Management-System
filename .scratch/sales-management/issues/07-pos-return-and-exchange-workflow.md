# 07: POS Return and Exchange Workflow

**What to build:** Quy trình Đổi / Trả hàng gộp trực tiếp tại quầy POS. Thu ngân có thể tra cứu hóa đơn cũ bằng mã đơn hàng hoặc số điện thoại khách hàng, chọn các sản phẩm khách muốn trả lại, đồng thời quét/thêm các sản phẩm mới khách muốn đổi lấy trên cùng một giao dịch. Hệ thống tự động tính số tiền chênh lệch (thu thêm hoặc trả lại khách), tạo đơn đổi trả liên kết với đơn gốc và hoàn trả số lượng hàng vào tồn thực tế (`On-hand Inventory`).

**Blocked by:** 06 (POS Customer Lookup and History Tracking)

**Status:** ready-for-agent

- [ ] Thu ngân mở màn hình "Đổi / Trả hàng", tìm kiếm hóa đơn cũ theo mã đơn hoặc SĐT khách.
- [ ] Màn hình liệt kê các món đã mua trong đơn gốc kèm số lượng tối đa có thể trả.
- [ ] Thu ngân chọn số lượng món cần trả, sau đó có thể thêm món mới muốn đổi vào giỏ hàng đổi trả.
- [ ] Giao diện tự động tính giá trị bù trừ: nếu tổng món mới > món cũ thì hiển thị số tiền thu thêm; nếu món mới < món cũ thì hiển thị số tiền hoàn lại cho khách.
- [ ] Khi hoàn tất, các sản phẩm trả lại được cộng trực tiếp vào `On-hand Inventory` của SKU tương ứng.
- [ ] Đơn gốc được đánh dấu trạng thái tương ứng (`Refunded` hoặc ghi nhận lịch sử đổi hàng từng phần).
- [ ] Viết test tích hợp bao phủ kịch bản đổi hàng bù thêm tiền và trả hàng hoàn lại tiền, xác minh số dư kho được hoàn đúng sau giao dịch.
