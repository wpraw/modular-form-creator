# Modular Form Creator — Resources Management

Frontend for creating, tracking and completing Resources through two modules (Basic Info and Project Details), built on the provided backend contract and design system. Domain terms used below (Draft, Completed, Provisioning, Edit Buffer, …) are defined in [CONTEXT.md](./CONTEXT.md).

## Running

**Whole stack in Docker** (MongoDB, backend, frontend):

```bash
docker compose up -d --build
```

- App: http://localhost:5173
- API: http://localhost:5001 (Swagger UI: http://localhost:5001/docs)

The frontend container builds the app (`tsc -b && vite build`) and serves it with `vite preview` on port 5173, which the backend already allows through `CORS_ORIGIN`.

**Local development** (backend in Docker, frontend with hot reload):

```bash
docker compose up -d mongo backend
cp .env.example .env   # VITE_API_URL=http://localhost:5001
npm install
npm run dev
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest, node) |
| `npm run storybook` | Design system Storybook |

## Routes

| Route | Page |
|---|---|
| `/resources` | List with name search, status filter, sort and paging (kept in the URL); create and delete |
| `/resources/:resourceId` | Overview: module states, module progress, Provisioning, Submit / Discard Changes |
| `/resources/:resourceId/basic-info` | Basic Info form |
| `/resources/:resourceId/project-details` | Project Details form (locked for a Draft until Basic Info is complete) |
| `/resources/:resourceId/details` | Read-only summary of the saved data |

## Business rules, as implemented

- A Resource is created from a name; the name is locked afterwards (shown read-only, always sent from the saved data).
- **Draft**: modules are saved one at a time (`PATCH`). Project Details unlocks once Basic Info is complete; opening it earlier redirects to the overview.
- **Provisioning** (`PATCH …/provisioning`) is the only Draft → Completed transition. It is enabled only when both modules are complete, asks for confirmation, and is never offered for a Completed resource.
- **Completed**: module forms write to the in-memory **Edit Buffer** instead of the API. The overview and list flag unsubmitted changes; **Submit Changes** sends one full `PUT` (saved data overlaid with the buffer), **Discard Changes** empties it. The buffer survives navigation inside the app and is lost on refresh or close, as required.
- Leaving a form with unsaved fields asks for confirmation (in-app navigation only).

## Architecture

```
src/
├── api/            # fetch client (errors → ApiError), Zod response schemas, one function per endpoint
├── resources/      # domain: constants, form schemas, module status rules, Edit Buffer store,
│   │               # TanStack Query hooks
│   ├── components/
│   └── pages/
├── shared/         # layout, Banner, ConfirmDrawer, table, pagination, hooks, formatting
├── design-system/  # provided, unchanged
└── router.tsx
```

State is split by kind ([ADR 0001](./docs/adr/0001-three-layer-state-split.md)):

| State | Tool |
|---|---|
| Server data | TanStack Query |
| Form fields and validation | React Hook Form, one form per module page |
| Edit Buffer | Zustand store keyed by resource ID, deliberately without persistence |

Zod validates every API response at the boundary and drives the forms with schemas that mirror the backend's validation rules ([ADR 0002](./docs/adr/0002-zod-at-api-boundary-and-forms.md)). Backend messages that name a field are shown on that field.

Workarounds for design-system gaps live in app code: `Select` placeholder options (an empty value would otherwise display the first option), a canonical team member order for `CheckboxGroup`, confirmations built on `Drawer` (there is no modal), and table and pagination primitives.

## Design notes

- [CONTEXT.md](./CONTEXT.md): domain glossary
- [docs/adr](./docs/adr): architecture decisions
- [docs/design-session.md](./docs/design-session.md): how the design was worked out before coding
