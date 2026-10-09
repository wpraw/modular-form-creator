import { useNavigate } from 'react-router-dom'
import { Button } from '../../design-system'
import { StatePanel } from './StatePanel'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <StatePanel
      title="Page not found"
      description="The page you are looking for doesn't exist."
      action={
        <Button type="button" onClick={() => navigate('/resources')}>
          Go to resources
        </Button>
      }
    />
  )
}
