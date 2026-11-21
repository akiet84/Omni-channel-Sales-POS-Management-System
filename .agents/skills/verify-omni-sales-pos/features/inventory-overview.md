# Inventory Overview

The Inventory Overview allows store managers and cashiers to inspect all active products and their real-time split inventory levels (`On-hand`, `Reserved`, and `Available`) to ensure physical stock and marketplace commitments are accurate.

## Sub-features

- `INV-LIST`: List all active SKUs across categories with prices and barcodes.
- `INV-SPLIT`: Display three-part inventory balances (`onHand`, `reserved`, `available`).
- `INV-MATH`: Verify that `available` strictly equals `onHand - reserved`.

## How to get to it (user POV)

- **Web Dashboard**: Navigate to `http://localhost:5173` and view the "Danh mục sản phẩm & Tồn kho khả dụng" table.
- **Backend API**: Send a `GET` request to `http://localhost:3001/api/skus`.

## Driving it with curl and API

Preconditions:
- Backend API running on `http://localhost:3001`.
- Clean seed data loaded (`pnpm --filter @omni-sales/api exec prisma db push --force-reset` then `pnpm --filter @omni-sales/api run seed`).

- **Query all SKUs and verify inventory split:**
  ```powershell
  $skus = curl.exe -s http://localhost:3001/api/skus | ConvertFrom-Json
  Write-Output "Total SKUs returned: $($skus.Count)"
  $allMathValid = $true
  foreach ($s in $skus) {
      if ($s.inventory.available -ne ($s.inventory.onHand - $s.inventory.reserved)) {
          $allMathValid = $false
      }
  }
  Write-Output "All SKUs satisfy Available == OnHand - Reserved: $allMathValid"
  ```
  Expected observable result:
  - `Total SKUs returned`: `>= 10`
  - `All SKUs satisfy Available == OnHand - Reserved`: `True`

- **Web UI table verification:**
  ```powershell
  $html = curl.exe -s http://localhost:5173
  $hasTitle = $html -match "Omni POS - Bán Hàng Đa Kênh"
  Write-Output "Web HTML renders Title: $hasTitle"
  ```
  Expected observable result:
  - Outputs `True`.

## Gotchas

- If database has not been seeded, `GET /api/skus` returns an empty array `[]`. Run seed command with `--force-reset` before driving.
- `available` must never be manually updated independently; it must always be computed from `onHand - reserved` as specified in ADR 0004.
