import type { z } from 'zod'
import { ErrorBodySchema } from './schemas'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

/** Form fields the backend names at the start of its validation messages. */
const FIELD_NAMES = [
  'resourceName',
  'owner',
  'email',
  'description',
  'priority',
  'projectName',
  'budget',
  'category',
] as const

export type ApiErrorField = (typeof FIELD_NAMES)[number] | 'options'

/** Normalized error for every failed request. `status` is 0 when the server is unreachable. */
export class ApiError extends Error {
  readonly status: number
  readonly field?: ApiErrorField

  constructor(status: number, message: string, field?: ApiErrorField) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.field = field
  }
}

/**
 * Maps a backend message to the form field it concerns, e.g.
 * "resourceName must be unique" → "resourceName". Team member messages map to "options".
 */
export function getErrorField(message: string): ApiErrorField | undefined {
  if (/team member/i.test(message)) {
    return 'options'
  }
  return FIELD_NAMES.find((field) => message.startsWith(`${field} `))
}

interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  schema: z.ZodType<T>
}

export async function request<T>(
  path: string,
  { method = 'GET', body, schema }: RequestOptions<T>,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errorBody = ErrorBodySchema.safeParse(data)
    const message = errorBody.success
      ? errorBody.data.message
      : `Request failed with status ${response.status}`
    throw new ApiError(response.status, message, getErrorField(message))
  }

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    const issuePath = parsed.error.issues[0]?.path.join('.') || 'response'
    throw new ApiError(response.status, `Unexpected server response (${issuePath}).`)
  }
  return parsed.data
}
