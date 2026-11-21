# 08: Split Inventory and Marketplace Ingestion Queue

**What to build:** Xây dựng cơ chế tách 3 chỉ số tồn kho (`On-hand`, `Reserved`, `Available = On-hand - Reserved`) và tầng tiếp nhận đơn hàng đa kênh bất đồng bộ qua hàng đợi Redis/BullMQ. Khi webhook đơn hàng mới từ các sàn TMĐT (Shopee, Lazada, TikTok Shop) đổ về, hệ thống đưa vào `Channel Queue` để xử lý tuần tự, tạo đơn hàng ở trạng thái `Pending`/`Confirmed`, tăng `Reserved Inventory` và giảm `Available Inventory` mà không làm thay đổi lượng hàng vật lý thực tế trên kệ (`On-hand`).

**Blocked by:** 01 (Monorepo Setup and Domain Foundations)

**Status:** ready-for-agent

- [ ] Lớp dịch vụ `InventoryService` quản lý công thức `available = onHand - reserved` nhất quán trên toàn bộ hệ thống.
- [ ] Xây dựng endpoint tiếp nhận webhook đơn hàng mẫu từ các kênh bán `POST /api/webhooks/channels/:channelId/orders`.
- [ ] Thiết lập hàng đợi BullMQ chạy trên Redis (`channel-order-queue`) để xử lý các sự kiện đơn hàng không đồng bộ và có cơ chế retry tự động khi lỗi.
- [ ] Xử lý sự kiện tạo đơn online: kiểm tra `available >= quantity`, tăng `reserved` lên tương ứng và giảm `available`, lưu `Order` với `channelId` và mã đơn sàn ngoại bộ.
- [ ] Nếu đơn sàn bị hủy (`Cancelled`), hệ thống tự động giảm `reserved` và hồi phục lại `available`.
- [ ] Viết test tích hợp giả lập webhook đơn hàng từ sàn, kiểm tra số liệu `On-hand` không đổi trong khi `Reserved` tăng và `Available` giảm chính xác.
