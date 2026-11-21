# Split Inventory Model: On-hand, Reserved, and Available

## Context
Trong bán hàng đa kênh, từ khi khách hàng online tạo đơn trên Shopee/Lazada đến khi shipper đến lấy hàng có độ trễ lớn (vài giờ đến 1 ngày). Nếu trừ thẳng kho vật lý ngay, thu ngân tại quầy kiểm đếm sẽ thấy lệch giữa số liệu và hàng trên kệ. Ngược lại nếu không giữ hàng, quầy có thể bán mất hàng của đơn online.

## Decision
Chúng tôi quyết định phân tách công thức tính tồn kho thành ba chỉ số độc lập:
1. `On-hand` (Tồn thực tế trên kệ/trong kho)
2. `Reserved` (Tồn tạm giữ cho các đơn online chưa bàn giao shipper)
3. `Available` (Tồn khả dụng để tiếp tục bán): `Available = On-hand - Reserved`

Khi đơn hàng tại quầy thanh toán: trừ trực tiếp vào `On-hand`.
Khi đơn online đổ về: tăng `Reserved`, giảm `Available`.
Khi đơn online đóng gói bàn giao shipper: giảm cả `On-hand` và `Reserved`.
Khi đơn online bị hủy: giảm `Reserved`, hồi phục `Available`.

## Consequences
- Ưu điểm: Phản ánh trung thực lượng hàng vật lý thực tế trên kệ, giúp thu ngân và thủ kho kiểm kê chính xác, đồng thời ngăn chặn 100% việc bán trùng đơn.
- Đánh đổi: Cần quản lý chặt chẽ vòng đời của `Reserved` để giải phóng kịp thời khi đơn hàng sàn bị hủy hoặc hết hạn thanh toán.
