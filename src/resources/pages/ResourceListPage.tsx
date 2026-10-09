import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import type { SortOrder } from '../../api/resources'
import type { Resource, ResourceStatus } from '../../api/schemas'
import { Button, Card, IconButton, Input, Select } from '../../design-system'
import { Banner } from '../../shared/components/Banner'
import { ConfirmDrawer } from '../../shared/components/ConfirmDrawer'
import { PageLayout } from '../../shared/components/PageLayout'
import { Pagination } from '../../shared/components/Pagination'
import { StatePanel } from '../../shared/components/StatePanel'
import { ClickableRow, Table, TableScroll, Td, Th } from '../../shared/components/Table'
import { formatDate } from '../../shared/format'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import { CreateResourceDrawer } from '../components/CreateResourceDrawer'
import { StatusBadge, UnsubmittedChangesBadge } from '../components/StatusBadge'
import { useEditBufferStore } from '../editBuffer'
import { getModuleProgress } from '../moduleStatus'
import { useDeleteResource, useResourceList } from '../queries'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

const parsePage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

const parseStatus = (value: string | null): ResourceStatus | undefined =>
  value === 'draft' || value === 'completed' ? value : undefined

export function ResourceListPage() {
  const navigate = useNavigate()
  // Filters, sorting and paging live in the URL: shareable and kept on refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const status = parseStatus(searchParams.get('status'))
  const sortOrder: SortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  const name = searchParams.get('name') ?? ''
  const debouncedName = useDebouncedValue(name.trim(), 300)
  const hasFilters = Boolean(status || name)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useResourceList({
    page,
    pageSize: PAGE_SIZE,
    status,
    name: debouncedName || undefined,
    sortOrder,
  })
  const buffers = useEditBufferStore((state) => state.buffers)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Resource>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletedName, setDeletedName] = useState<string>()
  const deleteResource = useDeleteResource()

  const updateParams = (changes: Record<string, string | undefined>) =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        Object.entries(changes).forEach(([key, value]) =>
          value ? next.set(key, value) : next.delete(key),
        )
        return next
      },
      { replace: true },
    )

  // Any filter change goes back to the first page.
  const updateFilter = (changes: Record<string, string | undefined>) =>
    updateParams({ ...changes, page: undefined })

  const openDelete = (resource: Resource) => {
    deleteResource.reset()
    setDeleteTarget(resource)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteResource.mutate(deleteTarget.resourceId, {
      onSuccess: (resource) => {
        setIsDeleteOpen(false)
        setDeletedName(resource.name)
      },
    })
  }

  const createButton = (
    <Button type="button" onClick={() => setIsCreateOpen(true)}>
      New resource
    </Button>
  )

  const renderContent = () => {
    if (isPending) {
      return <StatePanel title="Loading resources…" />
    }
    if (isError) {
      return (
        <StatePanel
          title="Couldn't load resources"
          description={error.message}
          action={
            <Button type="button" variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      )
    }
    if (data.items.length === 0) {
      return hasFilters ? (
        <StatePanel
          title="No resources match your filters"
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => updateFilter({ status: undefined, name: undefined })}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <StatePanel
          title="No resources yet"
          description="Create your first resource to get started."
          action={createButton}
        />
      )
    }

    return (
      <>
        <Card>
          <TableScroll>
            <Table aria-busy={isPlaceholderData}>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>Status</Th>
                  <Th>Modules</Th>
                  <Th>Created</Th>
                  <Th>
                    <VisuallyHidden>Actions</VisuallyHidden>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((resource) => (
                  <ClickableRow
                    key={resource.resourceId}
                    onClick={() => navigate(`/resources/${resource.resourceId}`)}
                  >
                    <Td>#{resource.resourceId}</Td>
                    <Td>
                      <NameCell>
                        <NameLink
                          to={`/resources/${resource.resourceId}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {resource.name}
                        </NameLink>
                        {resource.resourceId in buffers ? <UnsubmittedChangesBadge /> : null}
                      </NameCell>
                    </Td>
                    <Td>
                      <StatusBadge status={resource.status} />
                    </Td>
                    <Td>{getModuleProgress(resource)}/2 complete</Td>
                    <Td>{formatDate(resource.createdAt)}</Td>
                    <Td>
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="small"
                        aria-label={`Delete ${resource.name}`}
                        title="Delete"
                        onClick={(event) => {
                          event.stopPropagation()
                          openDelete(resource)
                        }}
                      >
                        🗑
                      </IconButton>
                    </Td>
                  </ClickableRow>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </Card>
        {data.pagination.totalPages > 1 ? (
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={(next) => updateParams({ page: String(next) })}
          />
        ) : null}
      </>
    )
  }

  return (
    <PageLayout title="Resources" actions={createButton}>
      {deletedName ? <Banner variant="success">Resource "{deletedName}" deleted.</Banner> : null}

      <Card>
        <Filters>
          <Input
            label="Search by name"
            type="search"
            placeholder="e.g. Analytics"
            value={name}
            onChange={(event) => updateFilter({ name: event.target.value || undefined })}
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status ?? ''}
            onChange={(event) => updateFilter({ status: event.target.value || undefined })}
          />
          <Select
            label="Sort by"
            options={SORT_OPTIONS}
            value={sortOrder}
            onChange={(event) =>
              updateFilter({ sortOrder: event.target.value === 'asc' ? 'asc' : undefined })
            }
          />
        </Filters>
      </Card>

      {renderContent()}

      <CreateResourceDrawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <ConfirmDrawer
        title="Delete resource"
        isOpen={isDeleteOpen}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isPending={deleteResource.isPending}
        error={deleteResource.error?.message}
      >
        Delete <strong>{deleteTarget?.name}</strong>?
      </ConfirmDrawer>
    </PageLayout>
  )
}

const Filters = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const NameCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const NameLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};

  &:hover {
    text-decoration: underline;
  }
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`
