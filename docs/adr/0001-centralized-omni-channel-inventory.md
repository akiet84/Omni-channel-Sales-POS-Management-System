# Centralized Inventory for Omni-channel Sales

## Context
Hệ thống cần phục vụ bán hàng đa kênh bao gồm bán lẻ trực tiếp tại quầy (POS) và đồng bộ đơn hàng từ các sàn thương mại điện tử / kênh online.

## Decision
Chúng tôi quyết định quản lý tồn kho tập trung (Centralized Inventory Balance) cho toàn bộ các kênh bán hàng dựa trên mã SKU duy nhất. Mọi giao dịch phát sinh đơn hàng tại bất kỳ kênh nào sẽ kích hoạt trừ tồn kho khả dụng ngay lập tức để đồng bộ tồn sang các sàn khác, thay vì phân chia hạn mức tồn kho riêng rẽ cho từng sàn (inventory partitioning).

## Consequences
- Ưu điểm: Tối ưu hóa năng lực bán hàng của toàn bộ lượng hàng tồn sẵn có, tránh tình trạng "cháy hàng ảo" ở một sàn trong khi hàng ở quầy vẫn còn.
- Thách thức: Đòi hỏi cơ chế xử lý đồng thời (concurrency control / optimistic locking) và hàng đợi đồng bộ thời gian thực đến các kênh online để ngăn chặn rủi ro bán vượt tồn (overselling).
