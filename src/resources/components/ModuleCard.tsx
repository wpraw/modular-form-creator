import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Resource } from '../../api/schemas'
import { Button, Card } from '../../design-system'
import { MODULE_LABELS, MODULE_PATHS, type ModuleKey } from '../constants'
import { getModuleState } from '../moduleStatus'
import { ModuleStateBadge } from './ModuleStateBadge'
import { UnsubmittedChangesBadge } from './StatusBadge'

const DESCRIPTIONS: Record<ModuleKey, string> = {
  basicInfo: 'Owner, contact email, description and priority.',
  projectDetails: 'Project name, budget, category and team members.',
}

interface ModuleCardProps {
  resource: Resource
  module: ModuleKey
  hasUnsubmittedChanges: boolean
}

export function ModuleCard({ resource, module, hasUnsubmittedChanges }: ModuleCardProps) {
  const navigate = useNavigate()
  const state = getModuleState(resource, module)
  const open = () => navigate(`/resources/${resource.resourceId}/${MODULE_PATHS[module]}`)

  return (
    <Card variant="elevated">
      <Header>
        <h2>{MODULE_LABELS[module]}</h2>
        <Badges>
          <ModuleStateBadge state={state} />
          {hasUnsubmittedChanges ? <UnsubmittedChangesBadge /> : null}
        </Badges>
      </Header>
      <Description>{DESCRIPTIONS[module]}</Description>
      {state === 'locked' ? (
        <Button type="button" variant="secondary" state="locked">
          Complete Basic Info first
        </Button>
      ) : (
        <Button
          type="button"
          variant={state === 'incomplete' ? 'primary' : 'secondary'}
          onClick={open}
        >
          {state === 'incomplete' ? 'Fill in' : 'Edit'}
        </Button>
      )}
    </Card>
  )
}

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};

  h2 {
    font-size: 1.25rem;
  }
`

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Description = styled.p`
  color: ${({ theme }) => theme.colors.inkMuted};
`
