import styled from 'styled-components'

/** Table primitives styled with theme tokens; the design system has no table component. */

export const TableScroll = styled.div`
  overflow-x: auto;
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
`

export const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.inkMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`

export const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
`

export const ClickableRow = styled.tr`
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }

  &:last-child td {
    border-bottom: none;
  }
`
