import {
  keepPreviousData,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ApiError } from '../api/client'
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  provisionResource,
  replaceResource,
  type ResourceListParams,
  updateBasicInfo,
  updateProjectDetails,
} from '../api/resources'
import type { BasicInfo, ProjectDetails, Resource, ResourcePayload } from '../api/schemas'
import { useEditBufferStore } from './editBuffer'

export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ResourceListParams) => [...resourceKeys.lists(), params] as const,
  detail: (id: number) => [...resourceKeys.all, 'detail', id] as const,
}

const isClientError = (error: unknown) =>
  error instanceof ApiError && error.status >= 400 && error.status < 500

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 4xx responses (invalid id, not found) won't change on retry.
        retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
      },
    },
  })
}

export function useResourceList(params: ResourceListParams) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => listResources(params),
    placeholderData: keepPreviousData,
  })
}

export function useResource(id: number | undefined) {
  return useQuery({
    queryKey: resourceKeys.detail(id ?? 0),
    queryFn: () => getResource(id!),
    enabled: id !== undefined,
  })
}

/**
 * Shared behaviour of mutations returning the updated Resource: store it as the
 * detail, refresh lists, and on failure refetch the detail so the UI reflects the
 * real server state (e.g. the Resource was provisioned in another tab).
 */
function useResourceMutation<TVariables>(
  id: number,
  mutationFn: (variables: TVariables) => Promise<Resource>,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (resource) => {
      queryClient.setQueryData(resourceKeys.detail(id), resource)
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
      onSuccess?.()
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) })
    },
  })
}

export function useUpdateBasicInfo(id: number) {
  return useResourceMutation(id, (basicInfo: BasicInfo) => updateBasicInfo(id, basicInfo))
}

export function useUpdateProjectDetails(id: number) {
  return useResourceMutation(id, (projectDetails: ProjectDetails) =>
    updateProjectDetails(id, projectDetails),
  )
}

export function useProvisionResource(id: number) {
  return useResourceMutation(id, () => provisionResource(id))
}

/** Submit Changes: one full `PUT`, after which the Edit Buffer is emptied. */
export function useSubmitChanges(id: number) {
  const clearBuffer = useEditBufferStore((state) => state.clear)
  return useResourceMutation(
    id,
    (payload: ResourcePayload) => replaceResource(id, payload),
    () => clearBuffer(id),
  )
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createResource,
    onSuccess: (resource) => {
      queryClient.setQueryData(resourceKeys.detail(resource.resourceId), resource)
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  const clearBuffer = useEditBufferStore((state) => state.clear)
  return useMutation({
    mutationFn: deleteResource,
    onSuccess: (resource) => {
      clearBuffer(resource.resourceId)
      queryClient.removeQueries({ queryKey: resourceKeys.detail(resource.resourceId) })
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}
