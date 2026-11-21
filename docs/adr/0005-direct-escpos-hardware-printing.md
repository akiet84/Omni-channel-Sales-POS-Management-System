# Direct ESC/POS Hardware Printing for Retail Checkout

## Context
Phương thức in qua trình duyệt chuẩn (`window.print()`) luôn bật lên hộp thoại in (print preview dialog) của hệ điều hành, yêu cầu thu ngân bấm xác nhận thêm một bước, không hỗ trợ in ngầm (silent print) tốc độ cao, và không thể gửi tín hiệu xung điện qua cổng RJ11 để tự động mở két đựng tiền.

## Decision
Chúng tôi quyết định từ chối phương pháp in Web Print thông thường và áp dụng giải pháp in lệnh máy trực tiếp (Direct ESC/POS Raw Printing). Ứng dụng web POS sẽ giao tiếp với máy in qua WebUSB / Web Serial API hoặc một local print agent service siêu nhẹ chạy ngầm trên máy POS để bắn trực tiếp lệnh ESC/POS tới máy in nhiệt K80.

## Consequences
- Ưu điểm:
  - Tốc độ in hóa đơn tức thì (dưới 0.5 giây) ngay khi bấm thanh toán, không hiện hộp thoại trình duyệt.
  - Tự động cắt giấy và kích hoạt mở két tiền tự động (cash drawer kick) khi thu ngân nhận tiền mặt.
- Đánh đổi:
  - Cần máy in hỗ trợ giao thức ESC/POS và trình duyệt hỗ trợ WebUSB/Web Serial (như Chrome/Edge) hoặc cài đặt một agent dịch vụ in cục bộ.
