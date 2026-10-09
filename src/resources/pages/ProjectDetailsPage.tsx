import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import type { Resource } from '../../api/schemas'
import { CheckboxGroup, Input, Select } from '../../design-system'
import { capitalize } from '../../shared/format'
import { flashState, useFlashMessage, useNavigateAfterSave } from '../../shared/hooks/useFlash'
import { ModuleFormLayout } from '../components/ModuleFormLayout'
import { ResourceLoader } from '../components/ResourceLoader'
import { CATEGORIES, TEAM_MEMBERS } from '../constants'
import { isSameModuleData, useEditBuffer, useEditBufferStore } from '../editBuffer'
import { applyServerError } from '../formErrors'
import { ProjectDetailsFormSchema, type ProjectDetailsFormValues } from '../formSchemas'
import { getModuleState } from '../moduleStatus'
import { useUpdateProjectDetails } from '../queries'

// The design-system Select has no placeholder; without this an empty value would display "Internal".
const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category…' },
  ...CATEGORIES.map((category) => ({ value: category, label: capitalize(category) })),
]

const TEAM_MEMBER_OPTIONS = [...TEAM_MEMBERS]

export function ProjectDetailsPage() {
  return (
    <ResourceLoader>
      {(resource) =>
        getModuleState(resource, 'projectDetails') === 'locked' ? (
          <Navigate
            to={`/resources/${resource.resourceId}`}
            replace
            state={flashState('Complete Basic Info first to unlock Project Details.', 'info')}
          />
        ) : (
          <ProjectDetailsForm resource={resource} />
        )
      }
    </ResourceLoader>
  )
}

function ProjectDetailsForm({ resource }: { resource: Resource }) {
  const id = resource.resourceId
  const isCompleted = resource.status === 'completed'
  const flash = useFlashMessage()
  const navigateAfterSave = useNavigateAfterSave()
  const updateProjectDetails = useUpdateProjectDetails(id)
  const keepModule = useEditBufferStore((state) => state.keepModule)

  // A Completed resource edits its buffered changes when there are any.
  const buffered = useEditBuffer(id)?.projectDetails
  const initial = (isCompleted && buffered) || resource.projectDetails

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProjectDetailsFormValues>({
    resolver: zodResolver(ProjectDetailsFormSchema),
    defaultValues: {
      projectName: initial.projectName,
      budget: initial.budget,
      category: initial.category,
      options: initial.options,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (isCompleted) {
      keepModule(id, 'projectDetails', values, resource.projectDetails)
      reset(values)
      navigateAfterSave(
        `/resources/${id}`,
        isSameModuleData(values, resource.projectDetails)
          ? 'Project Details match the saved data — nothing to submit.'
          : 'Project Details changes kept. Submit them to save.',
      )
      return
    }

    try {
      await updateProjectDetails.mutateAsync(values)
      reset(values)
      navigateAfterSave(`/resources/${id}`, 'Project Details saved.')
    } catch (error) {
      applyServerError(error, setError, ['projectName', 'budget', 'category', 'options'])
    }
  })

  return (
    <ModuleFormLayout
      resource={resource}
      module="projectDetails"
      flash={flash}
      serverError={errors.root?.serverError?.message}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      draftSubmitLabel="Save"
      onSubmit={onSubmit}
    >
      <Input label="Project name" error={errors.projectName?.message} {...register('projectName')} />
      <Input
        label="Budget"
        inputMode="numeric"
        helperText="Whole number, without currency or separators."
        error={errors.budget?.message}
        {...register('budget')}
      />
      <Select
        label="Category"
        options={CATEGORY_OPTIONS}
        error={errors.category?.message}
        {...register('category')}
      />
      <Controller
        control={control}
        name="options"
        render={({ field, fieldState }) => (
          <CheckboxGroup
            label="Team members"
            options={TEAM_MEMBER_OPTIONS}
            value={field.value}
            // CheckboxGroup appends in click order; keep the canonical order so the
            // payload is stable and re-checking an option doesn't mark the form dirty.
            onChange={(next) =>
              field.onChange(TEAM_MEMBERS.filter((member) => next.includes(member)))
            }
            error={fieldState.error?.message}
          />
        )}
      />
    </ModuleFormLayout>
  )
}
