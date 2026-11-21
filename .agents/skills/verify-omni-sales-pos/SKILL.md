---
name: verify-omni-sales-pos
description: "Drive and verify Omni-channel Sales & POS Management System (Fastify backend on port 3001, Vite React frontend on port 5173). Use when testing inventory balances, SKU lookups, POS counter checkout, or API health."
---

# Verify Omni-channel Sales & POS Management System

This skill provides an automated, programmatic way for an agent to launch, doctor-check, drive, and verify the Omni-channel Sales & POS Management System across both the backend API (`http://localhost:3001`) and the frontend POS web application (`http://localhost:5173`).

---

## 1. Launch

Start the backend API and frontend Vite server from the repository root:

### Step 1.1: Ensure Database & Seed Data
Before starting the servers, ensure the database schema is up to date and seeded:

```powershell
pnpm --filter @omni-sales/api run db:push
pnpm --filter @omni-sales/api run seed
```

**Ready condition:** The seed command outputs `Seeding complete! Total active SKUs in database: 10`.

### Step 1.2: Launch API Server
Start the Fastify API server on port 3001 in the background:

```powershell
pnpm --filter @omni-sales/api run dev
```

**Ready condition:** The process logs `Server listening on http://0.0.0.0:3001` and responds with HTTP 200 on `http://127.0.0.1:3001/healthz`.

### Step 1.3: Launch Web Application
Start the Vite development server on port 5173 in the background:

```powershell
pnpm --filter @omni-sales/web run dev -- --port 5173 --strictPort
```

**Ready condition:** The process logs `ready in ... ms` and responds with HTTP 200 on `http://127.0.0.1:5173`.

---

## 2. Doctor

Run this read-only health check first whenever an instance appears non-responsive:

```powershell
# 1. Check API Health endpoint
$apiHealth = curl.exe -s http://127.0.0.1:3001/healthz
Write-Output "API Health: $apiHealth"

# 2. Check Web Frontend HTTP response
$webStatus = curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:5173
Write-Output "Web Status Code: $webStatus"

# 3. Check Database Seed & Active SKUs
$skuCount = (curl.exe -s http://127.0.0.1:3001/api/skus | ConvertFrom-Json).Count
Write-Output "Active SKUs count: $skuCount"
```

**Expected Result:**
- `API Health`: `{"status":"ok",...}`
- `Web Status Code`: `200`
- `Active SKUs count`: `>= 10`

---

## 3. Drive

Drive the application either through API endpoints or browser driving.

### Option A: Automated Integration Suite
Run the full automated integration test suite covering inventory split calculations (On-hand, Reserved, Available):

```powershell
pnpm --filter @omni-sales/api run test
```

### Option B: Programmatic API Driving
Verify specific domain endpoints:

1. **List all Sales Channels:**
   ```powershell
   curl.exe -s http://127.0.0.1:3001/api/channels
   ```
2. **Search SKU by Barcode:**
   ```powershell
   curl.exe -s "http://127.0.0.1:3001/api/skus/search?code=893600100101"
   ```
3. **Keyword Search (Name/Category/Code):**
   ```powershell
   curl.exe -s "http://127.0.0.1:3001/api/skus?query=Cotton"
   ```

### Option C: Browser UI Driving
Handles in the React Web POS interface (`http://localhost:5173`):

| Target | Selector / Handle | Action |
| --- | --- | --- |
| Header Title | `h1` | Verify text contains "Omni-channel POS System" |
| Products Table | `table` | Verify visible |
| SKU Code Cells | `table tbody tr td:first-child` | Assert contains seeded codes (`AT-COT-TRANG-M`) |
| Available Column | `table tbody tr td:last-child` | Assert matches `onHand - reserved` |

---

## 4. Evidence

All verification proofs must capture:
1. The exact command invoked.
2. The returned output (HTTP status code, JSON response body, or DOM snapshot).
3. The database state demonstrating the side-effect (e.g. updated inventory numbers).

Save captured evidence to `.scratch/verification-proof/<run-id>/evidence.json`. Proof artifacts must persist after cleanup.

---

## 5. Cleanup

To tear down running background dev servers when verification is complete:

```powershell
# Stop background tasks started for API and Web
# Or terminate processes listening on ports 3001 and 5173
Get-NetTCPConnection -LocalPort 3001,5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
```

---

## 6. Features Map

See the detailed feature verification recipes in [features/README.md](./features/README.md):
- [Inventory Overview](./features/inventory-overview.md)
- [SKU & Barcode Search](./features/sku-barcode-search.md)
- [Sales Channels](./features/sales-channels.md)
