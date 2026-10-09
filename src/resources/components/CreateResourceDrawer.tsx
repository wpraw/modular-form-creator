import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ApiError } from '../../api/client'
import { Button, Drawer, Input } from '../../design-system'
import { Banner } from '../../shared/components/Banner'
import { flashState } from '../../shared/hooks/useFlash'
import { MODULE_PATHS } from '../constants'
import { CreateResourceSchema, type CreateResourceValues } from '../formSchemas'
import { useCreateResource } from '../queries'

interface CreateResourceDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateResourceDrawer({ isOpen, onClose }: CreateResourceDrawerProps) {
  const navigate = useNavigate()
  const createResource = useCreateResource()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<CreateResourceValues>({
    resolver: zodResolver(CreateResourceSchema),
    defaultValues: { resourceName: '' },
  })

  // The Drawer keeps its content mounted, so focus the field each time it opens.
  useEffect(() => {
    if (isOpen) setFocus('resourceName')
  }, [isOpen, setFocus])

  const close = () => {
    if (createResource.isPending) return
    reset()
    createResource.reset()
    onClose()
  }

  const onSubmit = handleSubmit(({ resourceName }) =>
    createResource.mutate(resourceName, {
      onSuccess: (resource) => {
        reset()
        onClose()
        navigate(`/resources/${resource.resourceId}/${MODULE_PATHS.basicInfo}`, {
          state: flashState(`Resource "${resource.name}" created. Fill in Basic Info next.`),
        })
      },
      onError: (error) => {
        if (error instanceof ApiError && error.field === 'resourceName') {
          setError('resourceName', { message: error.message })
        }
      },
    }),
  )

  const serverError =
    createResource.error instanceof ApiError && createResource.error.field === 'resourceName'
      ? undefined
      : createResource.error?.message

  return (
    <Drawer title="New resource" isOpen={isOpen} onClose={close}>
      <Form onSubmit={onSubmit} noValidate>
        <Input
          label="Resource name"
          helperText="The name can't be changed after creation."
          error={errors.resourceName?.message}
          autoComplete="off"
          {...register('resourceName')}
        />
        {serverError ? <Banner variant="error">{serverError}</Banner> : null}
        <Actions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" state={createResource.isPending ? 'disabled' : 'normal'}>
            {createResource.isPending ? 'Creating…' : 'Create resource'}
          </Button>
        </Actions>
      </Form>
    </Drawer>
  )
}

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
