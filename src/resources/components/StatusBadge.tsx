import type { ResourceStatus } from '../../api/schemas'
import { Badge } from '../../design-system'

export function StatusBadge({ status }: { status: ResourceStatus }) {
  return status === 'completed' ? (
    <Badge variant="success">Completed</Badge>
  ) : (
    <Badge variant="warning">Draft</Badge>
  )
}

export function UnsubmittedChangesBadge() {
  return <Badge variant="info">Unsubmitted changes</Badge>
}
