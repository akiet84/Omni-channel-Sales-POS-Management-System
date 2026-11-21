# Sales Management System (Omni-channel)

Hệ thống quản lý bán hàng đa kênh (Omni-channel Retail & E-commerce), hỗ trợ tạo đơn tại quầy (POS), đồng bộ đơn hàng từ các sàn/kênh bán và quản lý kho tập trung.

## Language

### Core Entities

**Order**:
Bản ghi giao dịch mua hàng của khách hàng phát sinh từ bất kỳ kênh bán hàng nào (tại quầy hoặc sàn TMĐT).
_Avoid_: Purchase, Transaction, Bill

**Sales Channel**:
Kênh hoặc nền tảng tiếp nhận đơn hàng (ví dụ: POS tại quầy, Shopee, Lazada, TikTok Shop, Website).
_Avoid_: Source, Platform, Storefront

**Customer**:
Cá nhân mua hàng được định danh bằng Số điện thoại, gắn liền với lịch sử mua sắm và chính sách bảo hành, đổi trả.
_Avoid_: Client, Buyer, Account

**SKU**:
Mã định danh duy nhất cho từng phiên bản sản phẩm có thể bán được (theo màu sắc, kích cỡ) phục vụ quản lý tồn kho.
_Avoid_: Product Code, Item ID, Barcode

### Inventory & Stock Calculation

**On-hand Inventory**:
Số lượng sản phẩm vật lý thực tế đang hiện diện trong kho hoặc trên kệ hàng của cửa hàng.
_Avoid_: Total stock, Physical count

**Reserved Inventory**:
Số lượng sản phẩm đã được cam kết cho các đơn hàng online đang chờ xác nhận/đóng gói nhưng chưa bàn giao cho bên vận chuyển.
_Avoid_: Held stock, Locked inventory

**Available Inventory**:
Số lượng sản phẩm thực tế có thể mở bán trên tất cả các kênh, tính bằng: `Available = On-hand - Reserved`.
_Avoid_: Salable stock, Net balance

### Integration & Processing

**Sales Channel Adapter**:
Tầng chuyển đổi trung gian làm nhiệm vụ chuẩn hóa dữ liệu đơn hàng và webhook từ các sàn TMĐT về mô hình `Order` nội bộ và ngược lại.
_Avoid_: Connector, Bridge, Plugin

**Channel Queue**:
Hàng đợi xử lý tác vụ nền tuần tự hóa việc tiếp nhận đơn từ các kênh và phân phối tín hiệu cập nhật số dư kho đến từng sàn.
_Avoid_: Task list, Background job

### Payment & Hardware Integration

**Payment Method**:
Phương thức thanh toán được khách hàng sử dụng để hoàn tất đơn hàng (Tiền mặt, Dynamic VietQR).
_Avoid_: Payment type, Billing mode

**Dynamic VietQR**:
Mã phản hồi nhanh (QR code) thanh toán ngân hàng được sinh tự động theo chuẩn VietQR, mang sẵn số tiền chính xác và mã đơn hàng trong payload.
_Avoid_: Static QR, Bank info, Transfer QR

**Direct Printing (ESC/POS)**:
Phương thức in hóa đơn truyền trực tiếp lệnh mã máy (raw bytes) đến máy in nhiệt khổ K80 mà không bật hộp thoại trình duyệt, hỗ trợ cắt giấy tự động và lệnh mở két tiền (cash drawer kick).
_Avoid_: Browser print, Web print

### Roles & Actors

**Cashier**:
Người dùng tại quầy chịu trách nhiệm quét mã, lập đơn hàng, nhận thanh toán và in biên lai, không có quyền xem giá vốn và báo cáo tổng.
_Avoid_: Staff, Clerk, Teller

**Administrator**:
Chủ cửa hàng hoặc quản lý có toàn quyền cấu hình sản phẩm, giá bán, kho hàng, kết nối kênh bán và theo dõi báo cáo doanh thu.
_Avoid_: Owner, Superuser
