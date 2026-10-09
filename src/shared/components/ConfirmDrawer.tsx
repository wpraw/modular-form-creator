import type { ReactNode } from 'react'
import styled from 'styled-components'
import { Button, Drawer } from '../../design-system'
import { Banner } from './Banner'

interface ConfirmDrawerProps {
  title: string
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  confirmLabel: string
  cancelLabel?: string
  /** Label shown on the confirm button while the action runs. */
  pendingLabel?: string
  isPending?: boolean
  error?: string
  children: ReactNode
}

/** Confirmation step built on the design-system Drawer (there is no modal component). */
export function ConfirmDrawer({
  title,
  isOpen,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel = 'Cancel',
  pendingLabel,
  isPending = false,
  error,
  children,
}: ConfirmDrawerProps) {
  const close = () => {
    if (!isPending) onCancel()
  }

  return (
    <Drawer title={title} isOpen={isOpen} onClose={close}>
      <div>{children}</div>
      {error ? <Banner variant="error">{error}</Banner> : null}
      <Actions>
        <Button type="button" variant="secondary" onClick={close} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          state={isPending ? 'disabled' : 'normal'}
        >
          {isPending ? (pendingLabel ?? confirmLabel) : confirmLabel}
        </Button>
      </Actions>
    </Drawer>
  )
}

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
