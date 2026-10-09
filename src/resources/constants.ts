/** Allowed values, mirrored from backend/src/modules/resources/resource.service.ts. */
export const PRIORITIES = ['low', 'medium', 'high'] as const
export const CATEGORIES = ['internal', 'external', 'vendor'] as const
export const TEAM_MEMBERS = [
  'FE devs',
  'BE devs',
  'Designer',
  'Data Eng',
  'Product Owner',
] as const

export type ModuleKey = 'basicInfo' | 'projectDetails'

export const MODULES: ModuleKey[] = ['basicInfo', 'projectDetails']

export const MODULE_LABELS: Record<ModuleKey, string> = {
  basicInfo: 'Basic Info',
  projectDetails: 'Project Details',
}

/** Route segment of each Module page under /resources/:resourceId. */
export const MODULE_PATHS: Record<ModuleKey, string> = {
  basicInfo: 'basic-info',
  projectDetails: 'project-details',
}
