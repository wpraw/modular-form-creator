import { useEffect, useState } from 'react'
import { type NavigateOptions, type To, useLocation, useNavigate } from 'react-router-dom'

interface FlashState {
  flash?: string
}

const readFlash = (state: unknown) => (state as FlashState | null)?.flash

/**
 * One-off success message passed with navigation. It is read once and then removed
 * from history state, so a refresh doesn't show it again.
 */
export function useFlashMessage(): string | undefined {
  const location = useLocation()
  const navigate = useNavigate()
  const [flash] = useState(() => readFlash(location.state))

  useEffect(() => {
    if (readFlash(location.state)) {
      navigate({ pathname: location.pathname, search: location.search }, { replace: true })
    }
  }, [location, navigate])

  return flash
}

/**
 * Navigates after the next render instead of immediately. After a successful save the
 * form is reset first, so the UnsavedChangesGuard sees a clean form before navigation.
 */
export function useNavigateAfterSave() {
  const navigate = useNavigate()
  const [pending, setPending] = useState<{ to: To; options: NavigateOptions }>()

  useEffect(() => {
    if (pending) navigate(pending.to, pending.options)
  }, [pending, navigate])

  return (to: To, flash: string) => setPending({ to, options: { state: { flash } } })
}
