import { z } from 'zod'
import { CATEGORIES, PRIORITIES, TEAM_MEMBERS } from './constants'

/**
 * Form input schemas mirroring the validation in
 * backend/src/modules/resources/resource.service.ts (see docs/adr/0002).
 * Text is trimmed before every check, exactly like the backend does.
 */

const NAME_PATTERN = /^[A-Za-z0-9 -]+$/
const OWNER_PATTERN = /^[A-Za-z ]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INTEGER_PATTERN = /^\d+$/

const requiredText = (label: string, maxLength?: number) => {
  const text = z.string().trim().min(1, `${label} is required`)
  return maxLength
    ? text.max(maxLength, `${label} must be at most ${maxLength} characters`)
    : text
}

const oneOf = (values: readonly string[], message: string) =>
  z.string().refine((value) => values.includes(value), message)

export const CreateResourceSchema = z.object({
  resourceName: requiredText('Resource name', 255).regex(
    NAME_PATTERN,
    'Use only letters, numbers, spaces and hyphens',
  ),
})

/** Basic Info without `resourceName`, which is locked after creation. */
export const BasicInfoFormSchema = z.object({
  owner: requiredText('Owner', 255).regex(OWNER_PATTERN, 'Use only letters and spaces'),
  email: requiredText('Email').regex(EMAIL_PATTERN, 'Enter a valid email address'),
  description: requiredText('Description', 1000),
  priority: oneOf(PRIORITIES, 'Select a priority'),
})

export const ProjectDetailsFormSchema = z.object({
  projectName: requiredText('Project name', 255).regex(
    NAME_PATTERN,
    'Use only letters, numbers, spaces and hyphens',
  ),
  budget: requiredText('Budget').regex(INTEGER_PATTERN, 'Budget must be a whole number'),
  category: oneOf(CATEGORIES, 'Select a category'),
  options: z
    .array(z.string())
    .min(1, 'Select at least one team member')
    .refine(
      (values) => values.every((value) => (TEAM_MEMBERS as readonly string[]).includes(value)),
      'Unsupported team member',
    ),
})

export type CreateResourceValues = z.infer<typeof CreateResourceSchema>
export type BasicInfoFormValues = z.infer<typeof BasicInfoFormSchema>
export type ProjectDetailsFormValues = z.infer<typeof ProjectDetailsFormSchema>
