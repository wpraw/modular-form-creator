import type { FormEventHandler, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Resource } from '../../api/schemas'
import { Button, Card } from '../../design-system'
import { Banner } from '../../shared/components/Banner'
import { PageLayout } from '../../shared/components/PageLayout'
import { UnsavedChangesGuard } from '../../shared/components/UnsavedChangesGuard'
import type { Flash } from '../../shared/hooks/useFlash'
import { MODULE_LABELS, type ModuleKey } from '../constants'
import { useEditBuffer } from '../editBuffer'
import { getModuleState } from '../moduleStatus'
import { ModuleStateBadge } from './ModuleStateBadge'
import { StatusBadge, UnsubmittedChangesBadge } from './StatusBadge'

interface ModuleFormLayoutProps {
  resource: Resource
  module: ModuleKey
  flash?: Flash
  serverError?: string
  isDirty: boolean
  isSubmitting: boolean
  /** Submit label for a Draft resource (Completed resources always "Keep changes"). */
  draftSubmitLabel: string
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
}

/** Shared page frame of the Basic Info and Project Details forms. */
export function ModuleFormLayout({
  resource,
  module,
  flash,
  serverError,
  isDirty,
  isSubmitting,
  draftSubmitLabel,
  onSubmit,
  children,
}: ModuleFormLayoutProps) {
  const navigate = useNavigate()
  const overviewPath = `/resources/${resource.resourceId}`
  const isCompleted = resource.status === 'completed'
  const hasUnsubmittedChanges = Boolean(useEditBuffer(resource.resourceId)?.[module])

  return (
    <PageLayout
      title={MODULE_LABELS[module]}
      back={{ to: overviewPath, label: resource.name }}
      meta={
        <>
          <StatusBadge status={resource.status} />
          <ModuleStateBadge state={getModuleState(resource, module)} />
          {hasUnsubmittedChanges ? <UnsubmittedChangesBadge /> : null}
        </>
      }
    >
      {flash ? <Banner variant={flash.variant}>{flash.message}</Banner> : null}
      {isCompleted ? (
        <Banner variant="info">
          This resource is Completed. Your edits are kept as unsubmitted changes and saved
          only when you submit them on the overview.
          {hasUnsubmittedChanges ? ' The form shows your unsubmitted changes.' : ''}
        </Banner>
      ) : null}

      <Card>
        <Form onSubmit={onSubmit} noValidate>
          {children}
          {serverError ? <Banner variant="error">{serverError}</Banner> : null}
          <Actions>
            <Button type="button" variant="secondary" onClick={() => navigate(overviewPath)}>
              Cancel
            </Button>
            <Button type="submit" state={isSubmitting ? 'disabled' : 'normal'}>
              {isSubmitting ? 'Saving…' : isCompleted ? 'Keep changes' : draftSubmitLabel}
            </Button>
          </Actions>
        </Form>
      </Card>

      <UnsavedChangesGuard when={isDirty} />
    </PageLayout>
  )
}

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
