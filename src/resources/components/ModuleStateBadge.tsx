import { Badge } from '../../design-system'
import type { ModuleState } from '../moduleStatus'

export function ModuleStateBadge({ state }: { state: ModuleState }) {
  switch (state) {
    case 'locked':
      return <Badge variant="neutral">🔒 Locked</Badge>
    case 'incomplete':
      return <Badge variant="warning">Incomplete</Badge>
    case 'complete':
      return <Badge variant="success">Complete</Badge>
  }
}
