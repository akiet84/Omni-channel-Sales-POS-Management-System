# Channel Adapter Pattern and Worker Queue for Multi-channel Sync

## Context
Các sàn thương mại điện tử (Shopee, Lazada, TikTok Shop) và kênh bán lẻ tại quầy đều có cấu trúc đơn hàng, vòng đời trạng thái và giao thức API/Webhook hoàn toàn khác nhau.

## Decision
Chúng tôi quyết định áp dụng mẫu thiết kế Channel Adapter kết hợp hàng đợi xử lý nền (Worker Queue qua Redis / BullMQ) để tiếp nhận đơn hàng từ các sàn. Tầng Adapter chịu trách nhiệm chuẩn hóa payload về thực thể `Order` duy nhất của hệ thống, sau đó đẩy sự kiện cập nhật số dư tồn kho (`InventoryUpdated`) vào hàng đợi để bất đồng bộ phát sóng đến các sàn đối tác.

## Consequences
- Ưu điểm: Hệ thống lõi hoàn toàn độc lập với chi tiết kỹ thuật của từng sàn. Dễ dàng bổ sung hoặc nâng cấp API của sàn mới mà không sửa logic thanh toán hay quản lý kho.
- Đánh đổi: Cần duy trì hạ tầng message queue và cơ chế tự động thử lại (retry with exponential backoff) khi các sàn gặp sự cố quá tải API.
