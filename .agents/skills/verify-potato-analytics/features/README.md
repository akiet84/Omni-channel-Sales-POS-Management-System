# Potato Analytics Feature Map

This directory maps every user-facing feature of Potato Analytics to its driving instructions and verification criteria.

## Feature Index

| Feature | Primary Path | Verification File | Proof Artifact |
| --- | --- | --- | --- |
| **KPI Metrics & Period Switcher** | Period buttons (`7d`, `30d`, `90d`) | [`metrics-and-periods.md`](./metrics-and-periods.md) | DOM text update + snapshot |
| **Orders Table & Filters** | Search input + status select | [`orders-filtering.md`](./orders-filtering.md) | Table rows filtered correctly |
| **Create New Order** | "Tạo đơn mới" modal form | [`create-order.md`](./create-order.md) | New order rendered in table |
