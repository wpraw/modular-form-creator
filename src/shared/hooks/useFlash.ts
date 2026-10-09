import { useEffect, useState } from 'react'
import { type To, useLocation, useNavigate } from 'react-router-dom'
import type { BannerVariant } from '../components/Banner'

export interface Flash {
  message: string
  variant: BannerVariant
}

/** Router state carrying a one-off message to the next page. */
export const flashState = (message: string, variant: BannerVariant = 'success') => ({
  flash: { message, variant } satisfies Flash,
})

const readFlash = (state: unknown) => (state as { flash?: Flash } | null)?.flash

/**
 * Reads the message passed with navigation once, then removes it from history state
 * so a refresh doesn't show it again.
 */
export function useFlashMessage(): Flash | undefined {
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
  const [pending, setPending] = useState<{ to: To; message: string }>()

  useEffect(() => {
    if (pending) navigate(pending.to, { state: flashState(pending.message) })
  }, [pending, navigate])

  return (to: To, message: string) => setPending({ to, message })
}
