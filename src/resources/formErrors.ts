import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '../api/client'

/**
 * Shows a failed save in the form: on the field the backend message names when the
 * form has it, otherwise as a form-level error (`root.serverError`).
 */
export function applyServerError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  const field = error instanceof ApiError ? error.field : undefined
  const formField = fields.find((name) => name === field)

  if (formField) {
    setError(formField, { message })
  } else {
    setError('root.serverError', { message })
  }
}
