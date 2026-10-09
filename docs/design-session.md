# Design session

Before writing any code, the design was worked out in a structured interview with an AI coding agent (Claude Code, using a "grill with docs" workflow): the agent explored the backend and design system, asked one decision at a time with a recommendation, and recorded settled terms in [CONTEXT.md](../CONTEXT.md) and hard-to-reverse decisions in [docs/adr](./adr). I made the calls; the agent proposed, researched and wrote things down.

This file records how the decisions evolved — including where my questions changed the outcome.

## How the decisions evolved

| # | Topic | Agent's first proposal | What changed it | Outcome |
|---|---|---|---|---|
| 1 | Edit Buffer storage | React Context + reducer | I asked whether Context survives a refresh (it doesn't — which is exactly what the assignment requires) and whether TanStack Query should be used | TanStack Query for server state; buffer kept **out** of the query cache, since a refetch would overwrite unsubmitted edits |
| 2 | Edit Buffer owner | — | I proposed React Hook Form as the buffer; the agent showed it would need one form in a layout route acting as form, buffer and validator for two different flows. I questioned the size of such a form and suggested Zustand | Three layers: TanStack Query / RHF per Module / Zustand buffer — [ADR 0001](./adr/0001-three-layer-state-split.md) |
| 3 | Buffer lifetime | — | Follow-up from #2 | Buffer is keyed by resource ID and survives leaving to the list (flagged there); lost on refresh |
| 4 | Validation | Zod | I asked to avoid the dependency and use RHF rules — the agent agreed, pointing out the trim pitfall (`"   "` passes `required` and the owner regex but fails on the backend) | Initially RHF rules |
| 5 | Contract safety | — | I asked how to protect the frontend from backend changes (tRPC?). tRPC needs server changes → disqualifying. The agent checked the Swagger spec and found it too loose to generate useful types (no enums/patterns/limits, no JSON endpoint), ruling out OpenAPI codegen | Zod returns in two roles — response parsing + form schemas — [ADR 0002](./adr/0002-zod-at-api-boundary-and-forms.md) |
| 6 | API layer | Thin `src/api/` module | I asked whether it counts as "bypassing the backend contract" (a disqualifying criterion) | Clarified: bypassing means circumventing rules (frontend-only status change, PUT on Draft, proxy); a module calling documented endpoints respects the contract. Kept, with no business logic |
| 7 | Unsaved-form guard | `useBlocker` + `beforeunload` warning when the buffer is non-empty | I asked when `isDirty` actually fires and when each mechanism applies; the agent mapped concrete scenarios | `useBlocker` only; **no** `beforeunload` — refresh discards the buffer as specified |
| 8 | Provisioning | — | I asked what provisioning is from the user's perspective | Irreversible Draft → Completed action with a confirmation step; stays on the overview afterwards |
| 9 | Delete confirmation | "Delete X? This can't be undone." | My call | Confirmation without the irreversibility note |

## What exploring the code surfaced

The agent read the backend and design-system source instead of relying on the README, which changed the plan:

- **Backend validation is stricter than documented** (regexes, length limits, enums, case-insensitive unique name, locked resource name) — mirrored in the form schemas.
- **Swagger is looser than the code** (no enums, patterns or limits; the provisioning response is a `oneOf`, while the controller always returns a plain `Resource`) — response types are written against the controller, not the docs. The agent initially misread the provisioning response from the service layer and corrected it once the controller was read.
- **The term "draft" is overloaded** in the assignment (status vs. unsaved changes) — the glossary reserves *Draft* for status and names the latter *Edit Buffer*.
- **Design system pitfalls**: `Select` has no placeholder (an empty `priority` would *display* "low"), `CheckboxGroup` appends in click order (false `isDirty`, unstable payload), `Drawer` keeps its content mounted when closed, `Button` has no loading state, and there is no Table or Modal component.
- **`useBlocker` requires a data router** — hence `createBrowserRouter`.
- **Docker**: the backend already allows `CORS_ORIGIN=http://localhost:5173`, so a `vite preview` container on that port needs no backend change.

## Artifacts

- [CONTEXT.md](../CONTEXT.md) — domain glossary (Resource, Status, Provisioning, Module states, Edit Buffer, Submit/Discard Changes)
- [ADR 0001](./adr/0001-three-layer-state-split.md) — state split
- [ADR 0002](./adr/0002-zod-at-api-boundary-and-forms.md) — Zod at the API boundary and in forms
