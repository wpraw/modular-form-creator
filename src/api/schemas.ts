import { z } from 'zod'

/**
 * Response schemas for the backend contract (see backend/README.md).
 * Objects are non-strict on purpose: fields added by the backend are ignored,
 * while removed or retyped fields fail loudly at the API boundary.
 */

export const ResourceStatusSchema = z.enum(['draft', 'completed'])

export const BasicInfoSchema = z.object({
  resourceName: z.string(),
  owner: z.string(),
  email: z.string(),
  description: z.string(),
  priority: z.string(),
})

export const ProjectDetailsSchema = z.object({
  projectName: z.string(),
  budget: z.string(),
  category: z.string(),
  options: z.array(z.string()),
})

export const ResourceSchema = z.object({
  _id: z.string(),
  resourceId: z.number(),
  name: z.string(),
  status: ResourceStatusSchema,
  basicInfo: BasicInfoSchema,
  projectDetails: ProjectDetailsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ResourceListSchema = z.object({
  items: z.array(ResourceSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
  }),
})

export const ErrorBodySchema = z.object({
  message: z.string(),
})

export type ResourceStatus = z.infer<typeof ResourceStatusSchema>
export type BasicInfo = z.infer<typeof BasicInfoSchema>
export type ProjectDetails = z.infer<typeof ProjectDetailsSchema>
export type Resource = z.infer<typeof ResourceSchema>
export type ResourceList = z.infer<typeof ResourceListSchema>

/** Body of `PUT /api/resources/{id}`. */
export interface ResourcePayload {
  name: string
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
}
