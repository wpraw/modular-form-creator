import { request } from './client'
import {
  type BasicInfo,
  type ProjectDetails,
  type ResourcePayload,
  type ResourceStatus,
  ResourceListSchema,
  ResourceSchema,
} from './schemas'

export type SortOrder = 'asc' | 'desc'

export interface ResourceListParams {
  page: number
  pageSize: number
  status?: ResourceStatus
  name?: string
  sortOrder: SortOrder
}

export function listResources({ page, pageSize, status, name, sortOrder }: ResourceListParams) {
  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortOrder,
  })
  if (status) search.set('status', status)
  if (name) search.set('name', name)

  return request(`/api/resources?${search}`, { schema: ResourceListSchema })
}

export function getResource(id: number) {
  return request(`/api/resources/${id}`, { schema: ResourceSchema })
}

export function createResource(resourceName: string) {
  return request('/api/resources', {
    method: 'POST',
    body: { resourceName },
    schema: ResourceSchema,
  })
}

export function updateBasicInfo(id: number, basicInfo: BasicInfo) {
  return request(`/api/resources/${id}/basic-info`, {
    method: 'PATCH',
    body: basicInfo,
    schema: ResourceSchema,
  })
}

export function updateProjectDetails(id: number, projectDetails: ProjectDetails) {
  return request(`/api/resources/${id}/project-details`, {
    method: 'PATCH',
    body: projectDetails,
    schema: ResourceSchema,
  })
}

export function provisionResource(id: number) {
  return request(`/api/resources/${id}/provisioning`, {
    method: 'PATCH',
    schema: ResourceSchema,
  })
}

export function replaceResource(id: number, payload: ResourcePayload) {
  return request(`/api/resources/${id}`, {
    method: 'PUT',
    body: payload,
    schema: ResourceSchema,
  })
}

export function deleteResource(id: number) {
  return request(`/api/resources/${id}`, { method: 'DELETE', schema: ResourceSchema })
}
