# Sales Channels

The Sales Channels feature manages the active platforms through which orders are received and inventory is synchronized, including in-store POS and external e-commerce marketplaces (Shopee, TikTok Shop).

## Sub-features

- `CH-LIST`: List active sales channels with their platform identifiers and types.
- `CH-TYPES`: Distinguish POS quầy channels (`POS`) from online e-commerce channels (`SHOPEE`, `TIKTOK_SHOP`).

## How to get to it (user POV)

- **Backend API**: Send a `GET` request to `http://localhost:3001/api/channels`.
- **Admin Dashboard**: Channel views in the web frontend are planned; channels are currently managed and inspected via API endpoints.

## Driving it with curl and API

Preconditions:
- Backend API running on `http://localhost:3001`.
- Clean seed data loaded (`pnpm --filter @omni-sales/api exec prisma db push --force-reset` then `pnpm --filter @omni-sales/api run seed`).

- **Query active sales channels:**
  ```powershell
  $channels = curl.exe -s http://localhost:3001/api/channels | ConvertFrom-Json
  Write-Output "Channels found: $($channels.Count)"
  $channels | ForEach-Object { Write-Output "Channel: $($_.name) - Type: $($_.type) - Active: $($_.isActive)" }
  ```
  Expected observable result:
  - Returns at least 3 channels: POS (`channel-pos-main`), Shopee (`channel-shopee`), and TikTok Shop (`channel-tiktok`).
  - All default channels have `isActive: true`.

## Gotchas

- The `GET /api/channels` endpoint filters with `where: { isActive: true }` at the database level, returning only active channels. Inactive channels (`isActive: false`) are suppressed.
