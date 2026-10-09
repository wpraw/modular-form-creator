import type { ReactNode } from 'react'
import styled from 'styled-components'
import { Card } from '../../design-system'

interface StatePanelProps {
  title: string
  description?: ReactNode
  action?: ReactNode
}

/** Centered message for loading, empty, error and not-found states. */
export function StatePanel({ title, description, action }: StatePanelProps) {
  return (
    <Card>
      <Content>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {action}
      </Content>
    </Card>
  )
}

const Content = styled.div`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl} 0;
  text-align: center;

  h2 {
    font-size: 1.25rem;
  }

  p {
    color: ${({ theme }) => theme.colors.inkMuted};
  }
`
