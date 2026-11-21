# Always-online POS for Real-time Inventory Consistency

## Context
Trong mô hình bán hàng đa kênh (Omni-channel) với kho hàng dùng chung tập trung, nguy cơ bán vượt tồn (overselling) rất cao nếu quầy bán hàng tiếp tục giao dịch trong khi mất kết nối mạng (offline).

## Decision
Chúng tôi quyết định ứng dụng POS tại quầy hoạt động theo cơ chế Always-online (luôn yêu cầu kết nối internet). Không hỗ trợ chế độ bán hàng ngoại tuyến (offline-first) có trừ kho cục bộ. Mọi thao tác thanh toán tại quầy đều phải gửi yêu cầu trực tiếp về máy chủ để khóa dòng và trừ số dư tồn kho thời gian thực.

## Consequences
- Ưu điểm: Đảm bảo tính nhất quán dữ liệu (strong consistency) tuyệt đối. Loại bỏ hoàn toàn rủi ro bán trùng hoặc âm kho giữa quầy và các sàn TMĐT.
- Đánh đổi: Nếu cửa hàng mất kết nối internet, thu ngân sẽ không thể hoàn tất giao dịch thanh toán trên hệ thống cho đến khi mạng được khôi phục (cửa hàng cần trang bị mạng dự phòng như 4G).
