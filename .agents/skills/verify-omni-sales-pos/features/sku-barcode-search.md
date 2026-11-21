# SKU and Barcode Search

The SKU and Barcode Search feature provides instant lookup capability for cashiers at the checkout counter and administrators in the warehouse, resolving a product variant by barcode or SKU identifier.

## Sub-features

- `SEARCH-BARCODE`: Exact match by numeric barcode string (e.g. `893600100101`).
- `SEARCH-SKU`: Exact match by alphanumeric SKU code (e.g. `AT-COT-TRANG-M`).
- `SEARCH-QUERY`: Partial keyword match across SKU names, SKU codes, barcodes, and parent product names.

## How to get to it (user POV)

- **Backend API**: Send a `GET` request to `http://localhost:3001/api/skus/search?code=<code-or-barcode>` or `GET /api/skus?query=<query>`.
- **POS Web Counter**: The current web dashboard (`http://localhost:5173`) renders the full inventory catalog table; barcode scanner input and counter search bar are planned frontend features and currently driven via API.

## Driving it with curl and API

Preconditions:
- Backend API running on `http://localhost:3001`.
- Clean seed data loaded (`pnpm --filter @omni-sales/api exec prisma db push --force-reset` then `pnpm --filter @omni-sales/api run seed`).

- **Look up by Barcode:**
  ```powershell
  $result = curl.exe -s "http://localhost:3001/api/skus/search?code=893600100101" | ConvertFrom-Json
  Write-Output "Found SKU: $($result.skuCode) - Name: $($result.name)"
  ```
  Expected observable result:
  - `$result.skuCode` equals `"AT-COT-TRANG-M"`.
  - `$result.name` contains `"Áo Thun Cotton - Trắng / M"`.

- **Look up by SKU Code:**
  ```powershell
  $result = curl.exe -s "http://localhost:3001/api/skus/search?code=SNK-CLS-TRANG-41" | ConvertFrom-Json
  Write-Output "Found SKU: $($result.skuCode) - Price: $($result.price)"
  ```
  Expected observable result:
  - `$result.skuCode` equals `"SNK-CLS-TRANG-41"`.
  - `$result.price` equals `650000`.

- **Search by keyword query:**
  ```powershell
  $results = curl.exe -s "http://localhost:3001/api/skus?query=Sneaker" | ConvertFrom-Json
  Write-Output "Matching Sneaker SKUs: $($results.Count)"
  ```
  Expected observable result:
  - `$results.Count` is `>= 2`.

- **Unknown Barcode / SKU Code Error Handling (404):**
  ```powershell
  $status = curl.exe -s -o NUL -w "%{http_code}" "http://localhost:3001/api/skus/search?code=000000000000"
  $body = curl.exe -s "http://localhost:3001/api/skus/search?code=000000000000"
  Write-Output "Status: $status, Body: $body"
  ```
  Expected observable result:
  - `Status`: `404`
  - `Body`: `{"error":"SKU not found"}`

## Gotchas

- Barcode matching is exact string matching. Stripping leading zeros will cause a 404.
- If a barcode does not exist in the database, the endpoint returns HTTP 404 with `{"error":"SKU not found"}`.
