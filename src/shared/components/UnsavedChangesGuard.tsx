import { useBlocker } from 'react-router-dom'
import { ConfirmDrawer } from './ConfirmDrawer'

/** Asks for confirmation before in-app navigation away from a form with unsaved fields. */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  const blocker = useBlocker(when)

  return (
    <ConfirmDrawer
      title="Unsaved changes"
      isOpen={blocker.state === 'blocked'}
      confirmLabel="Leave page"
      cancelLabel="Stay"
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    >
      You have unsaved changes in this form. If you leave now, they will be lost.
    </ConfirmDrawer>
  )
}
