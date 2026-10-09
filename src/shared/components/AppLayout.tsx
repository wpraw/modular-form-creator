import { Link, Outlet } from 'react-router-dom'
import styled from 'styled-components'

export function AppLayout() {
  return (
    <Shell>
      <TopBar>
        <Brand to="/resources">Resources Management</Brand>
      </TopBar>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  )
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const TopBar = styled.header`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.7);
`

const Brand = styled(Link)`
  font-family: ${({ theme }) => theme.typography.heading};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Main = styled.main`
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`
