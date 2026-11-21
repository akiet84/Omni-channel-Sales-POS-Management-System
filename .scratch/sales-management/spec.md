# Spec: Omni-channel Sales & POS Management System

Status: ready-for-agent
Triage: ready-for-agent

## Problem Statement

Các chủ cửa hàng bán lẻ (Retail Store Owners) và nhân viên thu ngân (Cashiers) hiện đang gặp khó khăn nghiêm trọng trong việc kiểm soát kinh doanh khi mở rộng bán hàng từ cửa hàng vật lý lên các sàn thương mại điện tử (Shopee, Lazada, TikTok Shop):
1. **Lệch tồn kho và Bán vượt tồn (Overselling)**: Khi một sản phẩm được bán tại quầy, tồn kho trên sàn không được cập nhật kịp thời, dẫn đến tình trạng sàn tiếp tục nhận đơn trong khi thực tế đã hết hàng, gây phạt hủy đơn và mất uy tín gian hàng.
2. **Quy trình thanh toán tại quầy chậm chạp**: Các giải pháp in hóa đơn thông thường qua hộp thoại trình duyệt bắt thu ngân phải bấm xác nhận thủ công nhiều bước, không tự động bật két tiền, gây ùn tắc tại quầy thanh toán vào giờ cao điểm.
3. **Phân tán dữ liệu đơn hàng**: Đơn hàng phát sinh từ quầy và từ các sàn nằm rải rác trên nhiều ứng dụng riêng biệt, gây khó khăn cho việc quản lý doanh thu, tra cứu lịch sử mua hàng theo số điện thoại khách hàng và xử lý đổi trả hàng.

## Solution

Xây dựng hệ thống Quản lý Bán hàng Đa kênh tập trung (Omni-channel Sales Management System) bao gồm ứng dụng web POS tốc độ cao cho thu ngân tại quầy và cổng quản trị (Admin Dashboard) cho chủ cửa hàng:
- **Tồn kho tập trung thời gian thực (Centralized Inventory)**: Đồng bộ số dư kho khả dụng (`Available Inventory`) giữa quầy và các sàn TMĐT thông qua tầng chuyển đổi `Sales Channel Adapter` và hàng đợi `Channel Queue`.
- **Phân tách trạng thái tồn kho**: Tách biệt rõ ràng giữa tồn thực tế trên kệ (`On-hand`), tồn đang giữ cho đơn sàn chờ đóng gói (`Reserved`), và tồn khả dụng mở bán (`Available = On-hand - Reserved`).
- **Thanh toán & In ấn tốc độ cao**: Màn hình POS hoạt động theo cơ chế Always-online để khóa tồn kho an toàn (Row-level lock), hỗ trợ thanh toán Tiền mặt (tự tính tiền thừa) và mã Dynamic VietQR, kết hợp in ngầm trực tiếp lệnh mã máy ESC/POS (Direct Printing) qua Web Serial/WebUSB và tự động bật két tiền.
- **Quy trình Đổi/Trả hàng gộp**: Tra cứu đơn hàng theo SĐT hoặc mã đơn, cho phép trả hàng và đổi sản phẩm khác trên cùng một giao dịch, tự động bù trừ chênh lệch tiền và hoàn hàng về `On-hand Inventory`.

## User Stories

### Quản lý Bán hàng tại Quầy (POS)

1. As a Cashier, I want to scan a product barcode or search by SKU/name, so that I can add items to the customer's cart quickly.
2. As a Cashier, I want to see real-time available stock next to each product variant in the search list, so that I do not sell items that have already been reserved for online orders.
3. As a Cashier, I want to modify item quantities, remove items, or clear the cart with keyboard shortcuts, so that I can process checkouts without touching the mouse.
4. As a Cashier, I want to apply a percentage or fixed amount discount to an individual item or the entire order within permitted limits, so that I can provide promotional incentives to customers.
5. As a Cashier, I want to lookup or register a customer using their phone number, so that their purchase is recorded against their order history for future warranty or exchange lookups.
6. As a Cashier, I want to select Cash payment and input the amount received, so that the system automatically calculates the exact change to return to the customer.
7. As a Cashier, I want to select Dynamic VietQR payment, so that a bank transfer QR code with the exact order total and reference code is displayed on screen for the customer to scan.
8. As a Cashier, I want the receipt to print immediately via ESC/POS without displaying a browser print dialog, so that customer wait time at the counter is minimized.
9. As a Cashier, I want the cash drawer to automatically pop open upon completing a cash payment, so that I can store notes and return change swiftly.
10. As a Cashier, I want to be alerted and blocked with a clear message if an item in the cart has insufficient available stock when completing checkout, so that overselling never occurs.
11. As a Cashier, I want to lookup an existing completed order by order code or customer phone number, so that I can initiate an exchange or return.
12. As a Cashier, I want to select returned items and choose replacement items in a single transaction, so that the system calculates the net amount to charge or refund automatically.

### Quản lý Kho & Tồn kho Đa kênh (Inventory & Channel Sync)

13. As an Administrator, I want each product variant to have a unique SKU and barcode, so that inventory tracking is unambiguous across all channels.
14. As an Administrator, I want to view On-hand, Reserved, and Available inventory figures side by side for every SKU, so that I can understand physical stock levels versus committed online orders.
15. As an Administrator, I want an incoming marketplace order to automatically place the required items into Reserved inventory, so that walk-in customers or other channels cannot buy those items.
16. As an Administrator, I want stock levels on all connected e-commerce marketplaces to be automatically updated whenever an in-store order completes, so that external listings reflect true available inventory immediately.
17. As an Administrator, I want to manually adjust stock levels with a recorded reason (damaged goods, stock count audit, supplier delivery), so that discrepancies can be corrected with an audit trail.
18. As an Administrator, I want an alert when any SKU's Available inventory falls below a user-defined threshold, so that replenishment orders can be planned in advance.

### Tích hợp Đơn hàng Đa kênh (Channel Management & Fulfillment)

19. As an Administrator, I want to connect e-commerce marketplace channels (Shopee, Lazada, TikTok Shop) via Sales Channel Adapters, so that orders and stock synchronize through a unified interface.
20. As an Administrator, I want marketplace order webhooks to be queued and processed sequentially, so that transient marketplace API failures do not disrupt counter sales.
21. As an Administrator, I want all orders across all channels to follow a unified status flow (`Pending` -> `Confirmed` -> `Shipping` -> `Completed` / `Cancelled` / `Refunded`), so that staff have a single operating model.
22. As an Administrator, I want online orders to transition from `Confirmed` to `Shipping` upon package handover to couriers, so that On-hand and Reserved inventories are decremented simultaneously.
23. As an Administrator, I want cancelled marketplace orders to automatically release their Reserved inventory back to Available stock, so that the goods can be sold to other buyers.

### Báo cáo & Phân quyền (Reporting & Role-Based Access)

24. As an Administrator, I want Cashiers to be restricted from viewing total revenue reports, profit margins, and supplier purchase costs, so that sensitive business figures remain confidential.
25. As an Administrator, I want to view daily, weekly, and monthly sales reports segmented by sales channel (In-store POS vs Shopee vs TikTok Shop), so that I can identify our most profitable channels.
26. As an Administrator, I want to see an end-of-day register closing report (Cash reconciliation), so that physical cash collected matches POS recorded receipts.

## Implementation Decisions

### 1. Architectural Shape & Monorepo
- The project is organized as a TypeScript Monorepo:
  - `apps/web`: Frontend React (Vite SPA) providing both the cashier POS interface and administrator dashboard.
  - `apps/api`: Backend service built with Node.js (TypeScript, Fastify/NestJS) handling business logic, database transactions, and marketplace webhooks.
  - `packages/shared-types`: Canonical TypeScript definitions for `Order`, `SKU`, `InventoryBalance`, `Customer`, and API schemas.
- Conforms to **ADR 0001 (Centralized Omni-channel Inventory)** and **ADR 0003 (Channel Adapter Pattern and Worker Queue)**.

### 2. High-Consistency Concurrency Control
- Conforms to **ADR 0002 (Always-online POS)**: The POS frontend is a thin client that never approves checkout locally without backend transaction verification.
- PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) or optimistic concurrency control via version fields protect inventory rows during checkout.
- Redis-backed BullMQ handles inbound webhook ingestion and outgoing inventory sync tasks to prevent external API rate-limiting from blocking synchronous POS threads.

### 3. Split Inventory Model
- Conforms to **ADR 0004 (Split Inventory Model)**:
  - `Available = On-hand - Reserved`
  - POS checkout directly decrements `On-hand`.
  - Marketplace order receipt increments `Reserved` and decrements `Available`.
  - Marketplace order dispatch decrements both `On-hand` and `Reserved`.
  - Order cancellation decrements `Reserved` and restores `Available`.

### 4. Direct Hardware Printing
- Conforms to **ADR 0005 (Direct ESC/POS Hardware Printing)**:
  - The POS web application communicates directly with thermal receipt printers via Web Serial / WebUSB API.
  - Generates binary ESC/POS command buffers directly in the browser (standard 80mm K80 layout), including paper cut command (`GS V 0`) and RJ11 cash drawer kick pulse (`ESC p 0 25 250`).
  - Completely bypasses `window.print()` dialog for instant, silent printing.

### 5. Unified Payment Processing
- Cash transactions record tendered amount and calculated change.
- Dynamic VietQR generates payment QR images on the POS screen formatted with Bank BIN, Account Number, Exact Total Amount, and unique Order Code in accordance with the National Payment Corporation of Vietnam (NAPAS) specification.

## Testing Decisions

### What Makes a Good Test
- Tests must verify external behavior through public seams, not implementation details or private methods.
- Tests should not break upon internal refactorings if business behavior remains unchanged.
- Avoid tautological assertions (asserting a mocked result against itself) and avoid bulk horizontal testing.

### Test Seams
1. **Primary Seam: Order & Inventory API Boundary (`POST /api/orders/checkout`, `POST /api/webhooks/channels/:channelId/orders`)**:
   - Drive realistic sales scenarios against the public API with an actual database (PostgreSQL test instance or testcontainers).
   - Assert:
     - POS checkout succeeds, decrements `On-hand`, and emits channel sync events.
     - Concurrent checkouts for the last remaining item result in exactly 1 success and 1 `INSUFFICIENT_STOCK` rejection.
     - Marketplace order ingestion increments `Reserved` and updates `Available`.
     - Order returns restore physical stock to `On-hand`.
2. **Secondary Seam: ESC/POS Binary Protocol Encoder**:
   - Pure function tests: given an `Order` object, assert that generated byte streams match expected ESC/POS control sequences (drawer kick code, bold headers, item table, barcode, cutter command).
3. **Tertiary Seam: Channel Adapter Ingestion**:
   - Feed raw sample marketplace payloads (Shopee, TikTok Shop JSON fixtures) into adapters; assert that standard canonical `Order` structures are generated accurately.

## Out of Scope

- **Offline POS checkout**: Bypassing server checks while offline is prohibited by ADR 0002 to maintain strict consistency.
- **Customer loyalty tiers & points**: Point accumulation, tier downgrades, and reward catalog redemption are deferred to a future phase.
- **Multi-warehouse distribution**: Current scope covers a single central warehouse/retail store; routing orders between multiple physical warehouses is out of scope.
- **B2B Wholesale & Extended Debt Aging**: B2B quotation workflows, contract terms, and installment debt tracking are out of scope.

## Further Notes

- All team members and AI agents working on this project must consult `GLOSSARY.md` for domain terminology and adhere to existing ADRs in `docs/adr/`.
- Local issue tracking follows the conventions specified in `.agents/plugins/mattpocock-skills/skills/setup-matt-pocock-skills/issue-tracker-local.md`.
