import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { Resource } from '../../api/schemas'
import { Button } from '../../design-system'
import { StatePanel } from '../../shared/components/StatePanel'
import { useResource } from '../queries'

const parseResourceId = (value: string | undefined) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

/** Loads the Resource from the `:resourceId` route param and renders loading/error states. */
export function ResourceLoader({ children }: { children: (resource: Resource) => ReactNode }) {
  const navigate = useNavigate()
  const resourceId = parseResourceId(useParams().resourceId)
  const { data, isPending, error, refetch } = useResource(resourceId)

  const backToList = (
    <Button type="button" onClick={() => navigate('/resources')}>
      Back to resources
    </Button>
  )

  const isNotFound =
    resourceId === undefined ||
    (error instanceof ApiError && (error.status === 404 || error.status === 400))

  if (isNotFound) {
    return (
      <StatePanel
        title="Resource not found"
        description="It may have been deleted, or the link is incorrect."
        action={backToList}
      />
    )
  }
  if (error) {
    return (
      <StatePanel
        title="Couldn't load the resource"
        description={error.message}
        action={
          <Button type="button" variant="secondary" onClick={() => void refetch()}>
            Try again
          </Button>
        }
      />
    )
  }
  if (isPending) {
    return <StatePanel title="Loading resource…" />
  }
  return children(data)
}
