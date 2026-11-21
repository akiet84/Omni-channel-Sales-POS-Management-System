# Omni-channel-Sales-POS-Management-System

Hệ thống Quản lý Bán hàng Đa kênh & POS Bán lẻ (Omni-channel Sales & POS Management System).

## 🚀 Tính năng & Module chính

1. **POS Bán lẻ Quầy (Point of Sale)**
   - Quét mã vạch, tìm kiếm nhanh SKU với autocomplete dropdown.
   - Điều hướng bàn phím toàn diện (`↑ / ↓` chọn dòng, `← / →` tăng giảm số lượng, `Delete` xóa dòng).
   - Phím tắt tác vụ nhanh: `F2` (Tìm kiếm), `F8` (Xóa giỏ hàng), `F9` (Mở thanh toán), `Escape` (Đóng modal / hủy tìm kiếm).
   - Hỗ trợ chiết khấu linh hoạt: Chiết khấu cố định (tiền mặt) hoặc tỷ lệ (%) theo từng dòng hoặc toàn hóa đơn.
   - Bất biến tồn kho thời gian thực: Kiểm tra lượng tồn khả dụng (`Available = max(0, onHand - reserved)`) trực tiếp trên giỏ hàng.

2. **Quản lý Tồn kho Đa kênh (Split Inventory Management)**
   - Cơ chế kho thống nhất (single source of truth) giữa quầy POS vật lý và các sàn thương mại điện tử (Shopee, TikTok Shop, Lazada).
   - Kiểm soát chặt chẽ quy tắc: `reserved >= 0` và `available = on_hand - reserved`.

3. **Kiến trúc Monorepo & Domain thuần túy**
   - Pure ESM logic đóng gói tại `@omni-sales/shared-types` phục vụ chia sẻ xuyên suốt giữa frontend và backend.
   - Backend Fastify + TypeScript + Prisma ORM (SQLite / PostgreSQL).
   - Frontend Vite + React + TypeScript + Tailwind CSS.

---

## 📂 Cấu trúc Dự án

```
.
├── apps/
│   ├── api/                   # Fastify backend, REST API, Prisma ORM
│   │   ├── prisma/            # Prisma schema, migrations, seed data
│   │   ├── src/               # Services, routes, domain logic
│   │   └── tests/             # Integration tests (Inventory, Orders)
│   └── web/                   # Vite + React frontend (POS, Dashboard)
│       └── src/
│           ├── components/    # POSScreen, CashRegister, Cart
│           ├── hooks/         # usePOSHotkeys, state management
│           └── domain/        # Frontend regression test suite
├── packages/
│   └── shared-types/          # Pure domain types, calculation utilities & DTOs
├── docs/                      # ADRs, Glossary, Agent rules
└── package.json               # Root monorepo workspace config (pnpm)
```

---

## 🛠 Hướng dẫn Cài đặt & Chạy ứng dụng

### Yêu cầu môi trường
- Node.js >= 18
- pnpm >= 8

### 1. Cài đặt dependencies
```bash
pnpm install
```

### 2. Khởi tạo Database & Seed dữ liệu mẫu
```bash
pnpm --filter @omni-sales/api exec prisma db push
pnpm --filter @omni-sales/api run db:seed
```

### 3. Chạy môi trường Development
```bash
# Chạy đồng thời cả API (port 3001) và Web (port 5173)
pnpm run dev
```

### 4. Kiểm thử & Build
```bash
# Chạy toàn bộ test suites
pnpm test

# Build toàn bộ packages & apps
pnpm run build
```

---

## 📋 Domain Invariants & Rules

- **Bất biến Tồn kho**: Lượng tồn khả dụng luôn thỏa mãn `available = on_hand - reserved`. Không bao giờ cho phép `reserved < 0`.
- **Cơ chế Khóa dòng (Row Lock)**: Đơn hàng POS thanh toán trừ trực tiếp `on_hand`, bảo vệ bằng giao dịch phân tán và transaction khóa bản ghi.

---

## 📄 License
MIT License.
