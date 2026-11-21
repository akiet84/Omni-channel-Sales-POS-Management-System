# 09: Outbound Real-time Stock Sync to Marketplaces

**What to build:** Xây dựng cơ chế phát sóng đồng bộ tồn kho ngược lại các sàn TMĐT theo thời gian thực (Outbound Inventory Sync). Bất cứ khi nào số dư kho khả dụng (`Available Inventory`) của một SKU bị thay đổi (do bán hàng tại quầy POS, đơn sàn mới đổ về, hủy đơn, hoặc điều chỉnh kiểm kho thủ công), hệ thống tự động đẩy tác vụ cập nhật số lượng tồn vào hàng đợi đồng bộ (`channel-sync-queue`) để gọi API cập nhật tồn kho sang tất cả các sàn TMĐT đang kết nối.

**Blocked by:** 08 (Split Inventory and Marketplace Ingestion Queue), 03 (POS Cash Checkout and Row Lock Deduction)

**Status:** ready-for-agent

- [ ] Lớp dịch vụ `ChannelSyncService` cung cấp giao diện chuẩn để gọi API cập nhật số lượng tồn kho theo từng sàn (Shopee, Lazada, TikTok Shop).
- [ ] Khi một đơn hàng POS tại quầy thanh toán xong, hệ thống tự động phát ra sự kiện `InventoryChanged` cho các SKU liên quan.
- [ ] Hàng đợi `channel-sync-queue` tiếp nhận sự kiện, nhóm các thay đổi SKU (debouncing / throttling nếu có nhiều giao dịch dồn dập) và gọi webhook/API đồng bộ ra ngoài.
- [ ] Thiết lập cơ chế ghi log lịch sử đồng bộ (thời gian, SKU, số lượng đã đồng bộ, phản hồi từ sàn, trạng thái thành công/thất bại).
- [ ] Cơ chế retry tự động theo chiến lược số mũ (exponential backoff) nếu API của sàn báo lỗi quá tải (rate limit).
- [ ] Viết test tích hợp: thực hiện thanh toán một đơn hàng tại quầy POS và xác nhận tác vụ đồng bộ được kích hoạt đẩy số dư mới sang mock channel adapter.
