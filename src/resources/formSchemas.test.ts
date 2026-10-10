import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import {
  BasicInfoFormSchema,
  CreateResourceSchema,
  ProjectDetailsFormSchema,
} from './formSchemas'

/** Returns the path of the first validation issue, or undefined when the input is valid. */
const firstIssuePath = (schema: z.ZodType, input: unknown) => {
  const result = schema.safeParse(input)
  return result.success ? undefined : result.error.issues[0]?.path.join('.')
}

describe('CreateResourceSchema', () => {
  it.each(['Analytics', 'Res-1 a', 'a'.repeat(255)])('accepts %j', (resourceName) => {
    expect(firstIssuePath(CreateResourceSchema, { resourceName })).toBeUndefined()
  })

  it.each(['', '   ', 'Res_1', 'Zażółć', 'a'.repeat(256)])('rejects %j', (resourceName) => {
    expect(firstIssuePath(CreateResourceSchema, { resourceName })).toBe('resourceName')
  })

  it('trims surrounding whitespace, like the backend', () => {
    expect(CreateResourceSchema.parse({ resourceName: '  Analytics  ' })).toEqual({
      resourceName: 'Analytics',
    })
  })
})

describe('BasicInfoFormSchema', () => {
  const valid = {
    owner: 'Jan Kowalski',
    email: 'jan@example.com',
    description: 'Internal analytics',
    priority: 'medium',
  }

  it('accepts valid Basic Info', () => {
    expect(firstIssuePath(BasicInfoFormSchema, valid)).toBeUndefined()
  })

  it.each([
    ['owner', ''],
    ['owner', '   '],
    ['owner', 'Agent 007'],
    ['owner', 'a'.repeat(256)],
    ['email', ''],
    ['email', 'jan@kowalski'],
    ['email', 'jan kowalski@example.com'],
    ['description', '   '],
    ['description', 'a'.repeat(1001)],
    ['priority', ''],
    ['priority', 'urgent'],
  ])('rejects %s = %j', (field, value) => {
    expect(firstIssuePath(BasicInfoFormSchema, { ...valid, [field]: value })).toBe(field)
  })

  it('accepts a description of exactly 1000 characters', () => {
    const input = { ...valid, description: 'a'.repeat(1000) }
    expect(firstIssuePath(BasicInfoFormSchema, input)).toBeUndefined()
  })
})

describe('ProjectDetailsFormSchema', () => {
  const valid = {
    projectName: 'Data Lake',
    budget: '12500',
    category: 'vendor',
    options: ['FE devs', 'Product Owner'],
  }

  it('accepts valid Project Details', () => {
    expect(firstIssuePath(ProjectDetailsFormSchema, valid)).toBeUndefined()
  })

  it.each([
    ['projectName', '   '],
    ['projectName', 'Data_Lake'],
    ['projectName', 'a'.repeat(256)],
    ['budget', ''],
    ['budget', '12.5'],
    ['budget', '-1'],
    ['budget', '1e3'],
    ['budget', '12 500'],
    ['category', ''],
    ['category', 'partner'],
    ['options', []],
    ['options', ['Tester']],
  ])('rejects %s = %j', (field, value) => {
    expect(firstIssuePath(ProjectDetailsFormSchema, { ...valid, [field]: value })).toBe(field)
  })

  it('accepts a zero budget, which is an integer for the backend', () => {
    expect(firstIssuePath(ProjectDetailsFormSchema, { ...valid, budget: '0' })).toBeUndefined()
  })
})
