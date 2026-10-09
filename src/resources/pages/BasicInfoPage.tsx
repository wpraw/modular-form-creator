import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Resource } from '../../api/schemas'
import { Input, Select } from '../../design-system'
import { capitalize } from '../../shared/format'
import { useFlashMessage, useNavigateAfterSave } from '../../shared/hooks/useFlash'
import { ModuleFormLayout } from '../components/ModuleFormLayout'
import { ResourceLoader } from '../components/ResourceLoader'
import { MODULE_PATHS, PRIORITIES } from '../constants'
import { isSameModuleData, useEditBuffer, useEditBufferStore } from '../editBuffer'
import { applyServerError } from '../formErrors'
import { BasicInfoFormSchema, type BasicInfoFormValues } from '../formSchemas'
import { useUpdateBasicInfo } from '../queries'

// The design-system Select has no placeholder; without this an empty value would display "Low".
const PRIORITY_OPTIONS = [
  { value: '', label: 'Select priority…' },
  ...PRIORITIES.map((priority) => ({ value: priority, label: capitalize(priority) })),
]

export function BasicInfoPage() {
  return <ResourceLoader>{(resource) => <BasicInfoForm resource={resource} />}</ResourceLoader>
}

function BasicInfoForm({ resource }: { resource: Resource }) {
  const id = resource.resourceId
  const isCompleted = resource.status === 'completed'
  const flash = useFlashMessage()
  const navigateAfterSave = useNavigateAfterSave()
  const updateBasicInfo = useUpdateBasicInfo(id)
  const keepModule = useEditBufferStore((state) => state.keepModule)

  // A Completed resource edits its buffered changes when there are any.
  const buffered = useEditBuffer(id)?.basicInfo
  const initial = (isCompleted && buffered) || resource.basicInfo

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(BasicInfoFormSchema),
    defaultValues: {
      owner: initial.owner,
      email: initial.email,
      description: initial.description,
      priority: initial.priority,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    // The name is locked after creation, so it always comes from the saved resource.
    const basicInfo = { ...values, resourceName: resource.basicInfo.resourceName }

    if (isCompleted) {
      keepModule(id, 'basicInfo', basicInfo, resource.basicInfo)
      reset(values)
      navigateAfterSave(
        `/resources/${id}`,
        isSameModuleData(basicInfo, resource.basicInfo)
          ? 'Basic Info matches the saved data — nothing to submit.'
          : 'Basic Info changes kept. Submit them to save.',
      )
      return
    }

    try {
      await updateBasicInfo.mutateAsync(basicInfo)
      reset(values)
      navigateAfterSave(
        `/resources/${id}/${MODULE_PATHS.projectDetails}`,
        'Basic Info saved. Continue with Project Details.',
      )
    } catch (error) {
      applyServerError(error, setError, ['owner', 'email', 'description', 'priority'])
    }
  })

  return (
    <ModuleFormLayout
      resource={resource}
      module="basicInfo"
      flash={flash}
      serverError={errors.root?.serverError?.message}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      draftSubmitLabel="Save and continue"
      onSubmit={onSubmit}
    >
      <Input
        label="Resource name"
        value={resource.name}
        state="locked"
        tooltip="The name can't be changed after creation."
        readOnly
      />
      <Input label="Owner" autoComplete="name" error={errors.owner?.message} {...register('owner')} />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Description"
        multiline
        rows={4}
        helperText="Up to 1000 characters."
        error={errors.description?.message}
        {...register('description')}
      />
      <Select
        label="Priority"
        options={PRIORITY_OPTIONS}
        error={errors.priority?.message}
        {...register('priority')}
      />
    </ModuleFormLayout>
  )
}
