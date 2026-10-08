# Split state into server cache, per-Module forms and an in-memory Edit Buffer store

Edits to a Completed Resource must be held client-side across page navigation, survive leaving the Resource, and be lost on refresh — then persisted as one full update. We give each kind of state its own tool: TanStack Query owns server state, each Module page owns a small React Hook Form instance (fields, validation, errors), and a Zustand store keyed by resource ID (no `persist` middleware) owns the Edit Buffer. A Module form for a Completed Resource is initialised from the buffer if present, else from server data, and on submit writes to the buffer instead of the API; Submit Changes merges server data with the buffer into a single `PUT`.

## Considered Options

- **Edit Buffer in the TanStack Query cache (`setQueryData`)** — rejected: the cache would describe state the server doesn't have, and any refetch or invalidation would silently overwrite unsubmitted edits.
- **One React Hook Form instance for the whole Resource in a layout route** — rejected: a single form would act as form state, buffer and validator for two different flows (per-Module `PATCH` for Draft, full `PUT` for Completed), forcing partial `trigger`/`reset` and `keepDirtyValues` juggling; it also loses the buffer when leaving the Resource.
- **React Context + `useReducer` for the buffer** — rejected in favour of Zustand: the buffer's lifetime shouldn't depend on where a provider sits in the tree, and selectors let badges subscribe to just "has changes".
- **`sessionStorage` / `localStorage` or Zustand `persist`** — rejected: survives refresh, which the assignment explicitly forbids.

## Consequences

- The buffer outlives navigation back to `/resources`, so the list can flag Resources with unsubmitted changes; deleting a Resource must also clear its buffer entry.
- Draft Resources never touch the buffer — their Module forms `PATCH` directly.
