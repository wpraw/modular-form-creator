import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Resource } from '../../api/schemas'
import { Button, Card } from '../../design-system'
import { Banner } from '../../shared/components/Banner'
import { ConfirmDrawer } from '../../shared/components/ConfirmDrawer'
import { PageLayout } from '../../shared/components/PageLayout'
import { useFlashMessage } from '../../shared/hooks/useFlash'
import { ModuleCard } from '../components/ModuleCard'
import { ResourceLoader } from '../components/ResourceLoader'
import { StatusBadge } from '../components/StatusBadge'
import { MODULE_LABELS, MODULES } from '../constants'
import { buildReplacePayload, useEditBuffer, useEditBufferStore } from '../editBuffer'
import { canProvision, getModuleProgress } from '../moduleStatus'
import { useProvisionResource, useSubmitChanges } from '../queries'

export function ResourceOverviewPage() {
  return <ResourceLoader>{(resource) => <Overview resource={resource} />}</ResourceLoader>
}

function Overview({ resource }: { resource: Resource }) {
  const navigate = useNavigate()
  const id = resource.resourceId
  const flash = useFlashMessage()
  const [message, setMessage] = useState<string>()

  const buffer = useEditBuffer(id)
  const clearBuffer = useEditBufferStore((state) => state.clear)
  const bufferedModules = MODULES.filter((module) => buffer?.[module])
  const bufferedLabel = bufferedModules.map((module) => MODULE_LABELS[module]).join(' and ')

  const provision = useProvisionResource(id)
  const [isProvisionOpen, setIsProvisionOpen] = useState(false)
  const submitChanges = useSubmitChanges(id)
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)

  const progress = getModuleProgress(resource)
  const isDraft = resource.status === 'draft'

  const openProvision = () => {
    provision.reset()
    setIsProvisionOpen(true)
  }

  const confirmProvision = () =>
    provision.mutate(undefined, {
      onSuccess: () => {
        setIsProvisionOpen(false)
        setMessage('Resource provisioned. It is now Completed.')
      },
    })

  const submit = () => {
    if (!buffer) return
    submitChanges.mutate(buildReplacePayload(resource, buffer), {
      onSuccess: () => setMessage('Changes submitted.'),
    })
  }

  const confirmDiscard = () => {
    clearBuffer(id)
    submitChanges.reset()
    setIsDiscardOpen(false)
    setMessage('Unsubmitted changes discarded.')
  }


  return (
    <PageLayout
      title={resource.name}
      back={{ to: '/resources', label: 'All resources' }}
      meta={
        <>
          <span>#{id}</span>
          <StatusBadge status={resource.status} />
          <span>{progress}/2 modules complete</span>
        </>
      }
      actions={
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(`/resources/${id}/details`)}
        >
          View details
        </Button>
      }
    >
      {message ? (
        <Banner variant="success">{message}</Banner>
      ) : flash ? (
        <Banner variant={flash.variant}>{flash.message}</Banner>
      ) : null}

      {buffer ? (
        <Banner
          variant="info"
          action={
            <Actions>
              <Button
                type="button"
                variant="secondary"
                size="small"
                disabled={submitChanges.isPending}
                onClick={() => setIsDiscardOpen(true)}
              >
                Discard changes
              </Button>
              <Button
                type="button"
                size="small"
                state={submitChanges.isPending ? 'disabled' : 'normal'}
                onClick={submit}
              >
                {submitChanges.isPending ? 'Submitting…' : 'Submit changes'}
              </Button>
            </Actions>
          }
        >
          You have unsubmitted changes in {bufferedLabel}. They are kept only in this tab
          and will be lost if you refresh or close it.
        </Banner>
      ) : null}
      {submitChanges.error ? (
        <Banner variant="error">
          Couldn't submit changes: {submitChanges.error.message}
        </Banner>
      ) : null}

      <Modules>
        {MODULES.map((module) => (
          <ModuleCard
            key={module}
            resource={resource}
            module={module}
            hasUnsubmittedChanges={Boolean(buffer?.[module])}
          />
        ))}
      </Modules>

      <Card>
        {isDraft ? (
          <StatusSection>
            <div>
              <h2>Provisioning</h2>
              <p>
                {canProvision(resource)
                  ? 'Both modules are complete. Provision the resource to make it Completed.'
                  : 'Complete both modules to provision this resource.'}
              </p>
            </div>
            <Button
              type="button"
              state={canProvision(resource) ? 'normal' : 'locked'}
              onClick={openProvision}
            >
              Provision resource
            </Button>
          </StatusSection>
        ) : (
          <StatusSection>
            <div>
              <h2>Completed</h2>
              <p>
                This resource has been provisioned. Module edits are kept as unsubmitted
                changes until you submit them.
              </p>
            </div>
          </StatusSection>
        )}
      </Card>

      <ConfirmDrawer
        title="Provision resource"
        isOpen={isProvisionOpen}
        onConfirm={confirmProvision}
        onCancel={() => setIsProvisionOpen(false)}
        confirmLabel="Provision"
        pendingLabel="Provisioning…"
        isPending={provision.isPending}
        error={provision.error?.message}
      >
        <p>
          Provisioning is final: <strong>{resource.name}</strong> will become Completed and
          can't return to Draft. Later edits will need to be submitted explicitly.
        </p>
      </ConfirmDrawer>

      <ConfirmDrawer
        title="Discard changes"
        isOpen={isDiscardOpen}
        onConfirm={confirmDiscard}
        onCancel={() => setIsDiscardOpen(false)}
        confirmLabel="Discard"
      >
        <p>Discard your unsubmitted changes in {bufferedLabel}?</p>
      </ConfirmDrawer>
    </PageLayout>
  )
}

const Modules = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`

const StatusSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  h2 {
    font-size: 1.25rem;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  p {
    color: ${({ theme }) => theme.colors.inkMuted};
  }
`

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`
