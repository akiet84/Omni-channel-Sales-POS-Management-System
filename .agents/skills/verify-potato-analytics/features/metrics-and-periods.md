# KPI Metrics & Period Switcher

The KPI Metrics section displays key commercial metrics (Total Revenue, Orders, Visitors, Conversion Rate) and dynamically updates based on the selected time window (7 Days, 30 Days, 90 Days).

## Sub-features

- `metrics-display` renders 4 primary KPI cards with value, percentage change, and trend direction.
- `period-switch-7d` recalibrates metrics and charts for the last 7 days.
- `period-switch-30d` recalibrates metrics and charts for the last 30 days (default).
- `period-switch-90d` recalibrates metrics and charts for the quarterly view.

## How to get to it (user POV)

- Navigate to the root URL `/`.
- Locate the 4 cards at the top of the dashboard.
- Use the period switcher buttons located in the chart section header (`7 Ngày`, `30 Ngày`, `90 Ngày`).

## Driving it with Playwright

Preconditions:
- Potato Analytics is running at `http://localhost:5173`.
- `curl.exe http://localhost:5173` returns HTTP 200.

1. **Verify Default (30d):**
   ```ts
   await expect(page.getByTestId('metric-value-revenue')).toHaveText('$124,590')
   ```
2. **Switch to 7d:**
   ```ts
   await page.getByTestId('period-btn-7d').click()
   await expect(page.getByTestId('metric-value-revenue')).toHaveText('$28,450')
   ```
3. **Switch to 90d:**
   ```ts
   await page.getByTestId('period-btn-90d').click()
   await expect(page.getByTestId('metric-value-revenue')).toHaveText('$380,120')
   ```

## Gotchas

- Clicking an already active period button does not emit change events; it maintains the current state.
- Ensure Recharts animation has settled or assert against text values directly.
