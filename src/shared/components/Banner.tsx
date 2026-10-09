import type { ReactNode } from 'react'
import styled, { type DefaultTheme } from 'styled-components'

export type BannerVariant = 'success' | 'error' | 'info'

interface BannerProps {
  variant: BannerVariant
  children: ReactNode
  /** Optional action rendered on the right, e.g. a button. */
  action?: ReactNode
}

/** Inline page-level message; the design system has no toast or alert component. */
export function Banner({ variant, children, action }: BannerProps) {
  return (
    <Wrapper $variant={variant} role={variant === 'error' ? 'alert' : 'status'}>
      <Message>{children}</Message>
      {action ? <div>{action}</div> : null}
    </Wrapper>
  )
}

const accent = (theme: DefaultTheme, variant: BannerVariant) =>
  ({
    success: theme.colors.success,
    error: theme.colors.warning,
    info: theme.colors.info,
  })[variant]

const Wrapper = styled.div<{ $variant: BannerVariant }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme, $variant }) => accent(theme, $variant)};
  background: ${({ theme }) => theme.colors.surface};
`

const Message = styled.div`
  color: ${({ theme }) => theme.colors.ink};
`
