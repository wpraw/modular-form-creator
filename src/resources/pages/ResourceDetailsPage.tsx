import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Resource } from '../../api/schemas'
import { Badge, Button, Card } from '../../design-system'
import { Banner } from '../../shared/components/Banner'
import { PageLayout } from '../../shared/components/PageLayout'
import { capitalize, formatBudget, formatDateTime } from '../../shared/format'
import { ModuleStateBadge } from '../components/ModuleStateBadge'
import { ResourceLoader } from '../components/ResourceLoader'
import { StatusBadge } from '../components/StatusBadge'
import { MODULE_LABELS, MODULE_PATHS, type ModuleKey } from '../constants'
import { useHasUnsubmittedChanges } from '../editBuffer'
import { getModuleProgress, getModuleState } from '../moduleStatus'

export function ResourceDetailsPage() {
  return <ResourceLoader>{(resource) => <Details resource={resource} />}</ResourceLoader>
}

/** Read-only summary of the saved data; unsubmitted changes are only flagged, never mixed in. */
function Details({ resource }: { resource: Resource }) {
  const id = resource.resourceId
  const overviewPath = `/resources/${id}`
  const hasUnsubmittedChanges = useHasUnsubmittedChanges(id)
  const { basicInfo, projectDetails } = resource

  return (
    <PageLayout
      title={resource.name}
      back={{ to: overviewPath, label: 'Overview' }}
      meta={
        <>
          <span>#{id}</span>
          <StatusBadge status={resource.status} />
          <span>{getModuleProgress(resource)}/2 modules complete</span>
        </>
      }
    >
      {hasUnsubmittedChanges ? (
        <Banner variant="info">
          This resource has unsubmitted changes that aren't shown here.{' '}
          <InlineLink to={overviewPath}>Review them on the overview</InlineLink>.
        </Banner>
      ) : null}

      <Card>
        <Fields>
          <Field label="Status">
            {resource.status === 'completed' ? 'Completed' : 'Draft'}
          </Field>
          <Field label="Created">{formatDateTime(resource.createdAt)}</Field>
          <Field label="Last updated">{formatDateTime(resource.updatedAt)}</Field>
        </Fields>
      </Card>

      <Sections>
        <ModuleSection resource={resource} module="basicInfo">
          <Field label="Resource name">{basicInfo.resourceName}</Field>
          <Field label="Owner">{basicInfo.owner}</Field>
          <Field label="Email">{basicInfo.email}</Field>
          <Field label="Priority">{basicInfo.priority && capitalize(basicInfo.priority)}</Field>
          <Field label="Description" wide>
            {basicInfo.description}
          </Field>
        </ModuleSection>

        <ModuleSection resource={resource} module="projectDetails">
          <Field label="Project name">{projectDetails.projectName}</Field>
          <Field label="Budget">
            {projectDetails.budget && formatBudget(projectDetails.budget)}
          </Field>
          <Field label="Category">
            {projectDetails.category && capitalize(projectDetails.category)}
          </Field>
          <Field label="Team members" wide>
            {projectDetails.options.length > 0 ? (
              <Members>
                {projectDetails.options.map((member) => (
                  <Badge key={member}>{member}</Badge>
                ))}
              </Members>
            ) : null}
          </Field>
        </ModuleSection>
      </Sections>
    </PageLayout>
  )
}

interface ModuleSectionProps {
  resource: Resource
  module: ModuleKey
  children: ReactNode
}

function ModuleSection({ resource, module, children }: ModuleSectionProps) {
  const navigate = useNavigate()
  const state = getModuleState(resource, module)

  return (
    <Card variant="elevated">
      <SectionHeader>
        <h2>{MODULE_LABELS[module]}</h2>
        <ModuleStateBadge state={state} />
      </SectionHeader>
      <Fields>{children}</Fields>
      <div>
        {state === 'locked' ? (
          <Button type="button" variant="secondary" size="small" state="locked">
            Complete Basic Info first
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() =>
              navigate(`/resources/${resource.resourceId}/${MODULE_PATHS[module]}`)
            }
          >
            Edit
          </Button>
        )}
      </div>
    </Card>
  )
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <FieldItem $wide={wide}>
      <dt>{label}</dt>
      <dd>{children || <Empty>Not provided</Empty>}</dd>
    </FieldItem>
  )
}

const Sections = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};

  h2 {
    font-size: 1.25rem;
  }
`

const Fields = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin: 0;
`

const FieldItem = styled.div<{ $wide?: boolean }>`
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};

  dt {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.inkMuted};
  }

  dd {
    margin: ${({ theme }) => theme.spacing.xs} 0 0;
    color: ${({ theme }) => theme.colors.inkStrong};
    overflow-wrap: anywhere;
    white-space: pre-line;
  }
`

const Empty = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-style: italic;
`

const Members = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

const InlineLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primaryStrong};
  text-decoration: underline;
`
