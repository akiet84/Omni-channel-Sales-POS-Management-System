# Omni-channel Sales & POS Feature Verification Map

This directory is the maintained source for verifying the user-facing behavior of the Omni-channel Sales & POS Management System. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch the backend API at `http://127.0.0.1:3001` and the web application at `http://127.0.0.1:5173`.
- Ensure database schema is migrated and default seeds are executed (`pnpm --filter @omni-sales/api run seed`).
- Run the Doctor check (`curl.exe -s http://127.0.0.1:3001/healthz`) and require status code 200.
- Never drive an instance that was not initialized with the baseline seed data.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions specify a prior mutation.
- Prefer stable handles (data attributes, semantic HTML elements, query parameters) over visual coordinates.
- Treat every command as literal. Keep parameters and expected values unchanged.
- Execute API actions using `curl.exe` or HTTP fetch.
- Execute UI actions against `http://127.0.0.1:5173`.
- Preserve proof artifacts in `.scratch/verification-proof/` during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final view.
- API proof includes the request URL, method, response body, and HTTP status code.
- UI proof includes the DOM snapshot or text content verification of the rendered table.
- Mutation proof includes a read-only secondary view verifying the database state.
- Report any unreachable path with the attempted command and the unmet precondition.

## Features

- [Inventory Overview](./inventory-overview.md): Viewing products with split inventory balances (`On-hand`, `Reserved`, `Available`).
- [SKU & Barcode Search](./sku-barcode-search.md): Instant lookup of items by barcode and SKU code.
- [Sales Channels](./sales-channels.md): Listing and inspecting active sales channels (POS quầy, Shopee, TikTok Shop).
