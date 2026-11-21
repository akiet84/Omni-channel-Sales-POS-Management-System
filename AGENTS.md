# Agent Guidelines & Enforcement Rules

This document records the rules enforced in this repository to prevent repeating past mistakes.

## Rules & Enforcement Table

| Rule | Enforcement Level | What Enforces It | Failure Mode Prevented |
| :--- | :--- | :--- | :--- |
| **Non-negative Reserved Inventory** | Architecture / Domain Logic | `InventoryService.adjustInventory` boundary checks | Prevents `reserved < 0`, which would artificially inflate `available` beyond physical `on-hand` stock. |
| **Split Inventory Invariant** | Architecture & Automated Tests | `inventory.test.ts` (`Available == On-hand - Reserved`) | Ensures all channels see consistent, un-partitioned available stock. |
| **No Foreign AI Configs** | Architecture & Repo Structure | Antigravity `plugin.json` and `.agents/` roots | Prevents mixing Claude/OpenAI-specific config files into Antigravity workspaces. |
| **No Unused React Default Imports** | TypeScript / Bundler Config | `tsconfig.json` (`noUnusedLocals: true` + `jsx: "react-jsx"`) | Prevents TS6133 build failures from obsolete React 17+ default imports. |

## Pointers

- Domain vocabulary: [GLOSSARY.md](./GLOSSARY.md)
- Architectural decisions: [docs/adr/](./docs/adr/)
- Decision trail: [decisions.tsv](./decisions.tsv)
- Verification harness: [.agents/skills/verify-omni-sales-pos/SKILL.md](./.agents/skills/verify-omni-sales-pos/SKILL.md)

## Agent skills

### Issue tracker

Issues and specs are tracked as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped 1:1 (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repository layout using `GLOSSARY.md` and `docs/adr/` at the repository root. See `docs/agents/domain.md`.

