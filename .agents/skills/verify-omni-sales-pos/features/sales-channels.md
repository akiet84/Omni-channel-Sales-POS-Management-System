# Sales Channels

The Sales Channels feature manages the active platforms through which orders are received and inventory is synchronized, including in-store POS and external e-commerce marketplaces (Shopee, TikTok Shop).

## Sub-features

- `CH-LIST`: List all configured sales channels with active statuses.
- `CH-TYPES`: Distinguish POS quầy channels from online e-commerce channels.

## How to get to it (user POV)

- **Admin Channel Settings**: Administrators view connected channels in the admin dashboard.
- **Backend API**: Send a `GET` request to `http://localhost:3001/api/channels`.

## Driving it with curl and API

Preconditions:
- Backend API running on `http://127.0.0.1:3001`.
- Seed data loaded.

- **Query active sales channels:**
  ```powershell
  $channels = curl.exe -s http://127.0.0.1:3001/api/channels | ConvertFrom-Json
  Write-Output "Channels found: $($channels.Count)"
  $channels | ForEach-Object { Write-Output "Channel: $($_.name) - Type: $($_.type) - Active: $($_.isActive)" }
  ```
  Expected observable result:
  - Returns at least 3 channels: POS (`channel-pos-main`), Shopee (`channel-shopee`), and TikTok Shop (`channel-tiktok`).
  - All default channels have `isActive: true`.

## Gotchas

- Inactive channels (`isActive: false`) are filtered out from default POS views so cashiers do not mistakenly assign orders to disabled channels.
