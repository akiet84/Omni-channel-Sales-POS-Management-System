---
name: verify-potato-analytics
description: Drive and verify Potato Analytics React web application in the browser. Use when validating dashboard metrics, chart period switching, order search/filtering, or new order creation.
---

# Verify Potato Analytics

This skill provides an automated, programmatic way for an agent to launch, doctor-check, drive, and verify the Potato Analytics React web application (`http://localhost:5173`) using Playwright.

## Launch

Start the Vite development server in the background:

```powershell
npm run dev -- --port 5173 --strictPort
```

**Ready condition:** The process logs `ready in ... ms` and responds with HTTP 200 on `http://localhost:5173`.

## Doctor

Perform a read-only health check to confirm the instance is up and ready to drive:

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://localhost:5173
```

- Expected output: `200`
- If connection fails or status code is not 200, run `npm run dev -- --port 5173 --strictPort` first.

## Drive

Drive the application either via the pre-configured Playwright test suite or via individual browser automation commands.

### Option A: Automated E2E Suite (Recommended)

Run the full verification suite which exercises all features, validates DOM assertions, and captures screenshots:

```powershell
npm run verify
```

### Option B: Interactive Selectors & Targets

Stable handles in the application for browser driving:

| Target | Selector / Handle | Action |
| --- | --- | --- |
| Root Container | `[data-testid="dashboard-root"]` | Assert visible |
| Global Search | `[data-testid="global-search-input"]` | `fill("keyword")` |
| Period 7d Button | `[data-testid="period-btn-7d"]` | `click()` |
| Period 30d Button | `[data-testid="period-btn-30d"]` | `click()` |
| Period 90d Button | `[data-testid="period-btn-90d"]` | `click()` |
| Status Filter | `[data-testid="filter-status-select"]` | `selectOption("Completed" / "Pending" / "Cancelled")` |
| Open New Order | `[data-testid="btn-open-new-order"]` | `click()` |
| Customer Input | `[data-testid="input-customer"]` | `fill("Name")` |
| Amount Input | `[data-testid="input-amount"]` | `fill("100")` |
| Submit Order | `[data-testid="btn-submit-order"]` | `click()` |

## Evidence

Every verification run generates concrete visual and status evidence stored under `verification-evidence/`:

- **Screenshot proof**: `verification-evidence/dashboard-verified.png`
- **Playwright Test Report**: Terminal exit code `0` and test logs reporting `1 passed`.
- Evidence files survive teardown and are never deleted by cleanup.

## Cleanup

To stop running dev servers and release port 5173:

```powershell
# Stop background tasks or kill the specific process listening on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
```

## Helpers

- `npm run verify` : Executes Playwright E2E verification tests (`playwright test`).
- `npm run build` : Verifies TypeScript compilation and bundle health.
