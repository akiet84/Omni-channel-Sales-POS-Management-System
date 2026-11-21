# 01: Monorepo Setup and Domain Foundations

**What to build:** Thiết lập bộ khung dự án Monorepo đầy đủ gồm Frontend (`apps/web`), Backend (`apps/api`), và thư viện dùng chung (`packages/shared-types`). Định nghĩa lược đồ cơ sở dữ liệu (Prisma Schema trên PostgreSQL) phản ánh các thực thể cốt lõi (`Product`, `SKU`, `InventoryBalance`, `Order`, `OrderItem`, `Customer`, `SalesChannel`), kèm script seed dữ liệu mẫu sản phẩm/tồn kho thực tế và bộ khung kiểm thử tích hợp (integration test harness).

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Cấu trúc Monorepo (`pnpm-workspace.yaml`) hoạt động trơn tru giữa `apps/web`, `apps/api`, và `packages/shared-types`.
- [x] Prisma schema định nghĩa chuẩn các thực thể miền: `Product`, `SKU`, `InventoryBalance` (với `onHand`, `reserved`, `available`), `Order`, `OrderItem`, `Customer`, `SalesChannel`.
- [x] Database migration chạy thành công trên PostgreSQL/SQLite cục bộ.
- [x] Script seed (`npm run seed`) tạo thành công 10 sản phẩm mẫu có SKU, barcode và số dư tồn kho ban đầu.
- [x] `packages/shared-types` xuất khẩu đầy đủ TypeScript interfaces cho DTOs và domain models, cả frontend và backend đều import và build sạch không lỗi.
- [x] Viết test tích hợp đầu tiên xác nhận có thể truy vấn danh sách SKU và tồn kho khả dụng từ cơ sở dữ liệu.
