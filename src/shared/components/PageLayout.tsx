import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

interface PageLayoutProps {
  title: ReactNode
  /** Extra header content under the title, e.g. status badges. */
  meta?: ReactNode
  back?: { to: string; label: string }
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({ title, meta, back, actions, children }: PageLayoutProps) {
  return (
    <Page>
      {back ? <BackLink to={back.to}>← {back.label}</BackLink> : null}
      <Header>
        <TitleBlock>
          <h1>{title}</h1>
          {meta ? <Meta>{meta}</Meta> : null}
        </TitleBlock>
        {actions ? <Actions>{actions}</Actions> : null}
      </Header>
      {children}
    </Page>
  )
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`

const BackLink = styled(Link)`
  justify-self: start;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.primaryStrong};

  &:hover {
    text-decoration: underline;
  }
`

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const TitleBlock = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};

  h1 {
    font-size: 2rem;
  }
`

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`
