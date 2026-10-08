# Validate API responses and form input with Zod schemas mirroring backend rules

The backend contract is fixed and may not be modified, yet the frontend needs protection against contract drift and needs field-level validation the backend can't provide (it returns only the first error as a single `message`, without a field reference). We use Zod in two roles: every API response is parsed at the boundary in `src/api/` (types come from `z.infer`), and form input schemas — fed to React Hook Form via `zodResolver` — mirror the rules in `backend/src/modules/resources/resource.service.ts` (trimmed required fields, name/owner regexes, length limits, enums, integer-only budget, at least one Team Member). The backend stays the source of truth: any unknown 400 is still surfaced from its `message`, mapped to a field when the message starts with a field name.

## Considered Options

- **tRPC / ts-rest / GraphQL** — rejected: all require changing the server, which disqualifies the submission.
- **Generating types from the OpenAPI spec (`openapi-typescript`)** — rejected: the Swagger spec in `backend/src/config/swagger.ts` disagrees with the code (`ProvisioningResponse` documents `Resource | {message, resource}` while the service returns `{alreadyCompleted, resource}`; `category` has no enum; no patterns or length limits) and no JSON spec endpoint is exposed — we would generate wrong types with extra tooling.
- **React Hook Form built-in rules + hand-written interfaces** — viable for 9 flat fields and avoids a dependency, but once Zod is needed for response parsing, keeping a second validation system for forms hurts readability.

## Consequences

- Validation rules are duplicated from the backend; if the backend changed them, the frontend would drift. Acceptable because the contract is frozen, and the server-error fallback still shows any new rule.
- Response schemas use non-strict `z.object`, so fields added by the backend are ignored, while removed or retyped fields fail loudly at the boundary instead of deep in the UI.
