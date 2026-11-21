# SKU and Barcode Search

The SKU and Barcode Search feature provides instant lookup capability for cashiers at the checkout counter and administrators in the warehouse, resolving a product variant by barcode or SKU identifier.

## Sub-features

- `SEARCH-BARCODE`: Exact match by numeric barcode string (e.g. `893600100101`).
- `SEARCH-SKU`: Exact match by alphanumeric SKU code (e.g. `AT-COT-TRANG-M`).
- `SEARCH-QUERY`: Partial keyword match across product names, categories, or variant attributes.

## How to get to it (user POV)

- **POS Counter**: Cashier scans a barcode with a scanner gun or types the SKU into the search input.
- **Backend API**: Send a `GET` request to `http://localhost:3001/api/skus/search?code=<code-or-barcode>`.

## Driving it with curl and API

Preconditions:
- Backend API running on `http://127.0.0.1:3001`.
- Seed data loaded.

- **Look up by Barcode:**
  ```powershell
  $result = curl.exe -s "http://127.0.0.1:3001/api/skus/search?code=893600100101" | ConvertFrom-Json
  Write-Output "Found SKU: $($result.skuCode) - Name: $($result.name)"
  ```
  Expected observable result:
  - `$result.skuCode` equals `"AT-COT-TRANG-M"`.
  - `$result.name` contains `"Áo Thun Cotton - Trắng / M"`.

- **Look up by SKU Code:**
  ```powershell
  $result = curl.exe -s "http://127.0.0.1:3001/api/skus/search?code=SNK-CLS-TRANG-41" | ConvertFrom-Json
  Write-Output "Found SKU: $($result.skuCode) - Price: $($result.price)"
  ```
  Expected observable result:
  - `$result.skuCode` equals `"SNK-CLS-TRANG-41"`.
  - `$result.price` equals `650000`.

- **Search by keyword query:**
  ```powershell
  $results = curl.exe -s "http://127.0.0.1:3001/api/skus?query=Sneaker" | ConvertFrom-Json
  Write-Output "Matching Sneaker SKUs: $($results.Count)"
  ```
  Expected observable result:
  - `$results.Count` is `>= 2`.

## Gotchas

- Barcode matching is exact string matching. Stripping leading zeros will cause a 404.
- If a barcode does not exist in the database, the endpoint returns HTTP 404 with `{"error":"SKU not found"}`.
