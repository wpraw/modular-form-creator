import type { BasicInfo, ProjectDetails, Resource } from '../api/schemas'
import type { ModuleKey } from './constants'

/** Module states shown to the user — see "Modules" in CONTEXT.md. */
export type ModuleState = 'locked' | 'incomplete' | 'complete'

export type ModuleProgress = 0 | 1 | 2

type ResourceModules = Pick<Resource, 'status' | 'basicInfo' | 'projectDetails'>

/** Same rule as the backend's isBasicInfoComplete: every field holds a value. */
export function isBasicInfoComplete(basicInfo: BasicInfo): boolean {
  return Boolean(
    basicInfo.resourceName &&
      basicInfo.owner &&
      basicInfo.email &&
      basicInfo.description &&
      basicInfo.priority,
  )
}

/** Same rule as the backend's isProjectDetailsComplete: every field holds a value. */
export function isProjectDetailsComplete(projectDetails: ProjectDetails): boolean {
  return Boolean(
    projectDetails.projectName &&
      projectDetails.budget &&
      projectDetails.category &&
      projectDetails.options.length > 0,
  )
}

export function getModuleState(resource: ResourceModules, module: ModuleKey): ModuleState {
  if (module === 'basicInfo') {
    return isBasicInfoComplete(resource.basicInfo) ? 'complete' : 'incomplete'
  }
  if (resource.status === 'draft' && !isBasicInfoComplete(resource.basicInfo)) {
    return 'locked'
  }
  return isProjectDetailsComplete(resource.projectDetails) ? 'complete' : 'incomplete'
}

export function getModuleProgress(resource: ResourceModules): ModuleProgress {
  const basicInfo = isBasicInfoComplete(resource.basicInfo) ? 1 : 0
  const projectDetails = isProjectDetailsComplete(resource.projectDetails) ? 1 : 0
  return (basicInfo + projectDetails) as ModuleProgress
}

/** Provisioning is the only Draft → Completed transition and needs both Modules complete. */
export function canProvision(resource: ResourceModules): boolean {
  return resource.status === 'draft' && getModuleProgress(resource) === 2
}
