import { describe, expect, it } from 'vitest'
import type { BasicInfo, ProjectDetails, Resource } from '../api/schemas'
import {
  canProvision,
  getModuleProgress,
  getModuleState,
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from './moduleStatus'

const completeBasicInfo: BasicInfo = {
  resourceName: 'Analytics Platform',
  owner: 'Jan Kowalski',
  email: 'jan@example.com',
  description: 'Internal analytics',
  priority: 'high',
}

const completeProjectDetails: ProjectDetails = {
  projectName: 'Data Lake',
  budget: '12500',
  category: 'internal',
  options: ['FE devs'],
}

const emptyBasicInfo: BasicInfo = {
  resourceName: 'Analytics Platform',
  owner: '',
  email: '',
  description: '',
  priority: '',
}

const emptyProjectDetails: ProjectDetails = {
  projectName: '',
  budget: '',
  category: '',
  options: [],
}

type ResourceModules = Pick<Resource, 'status' | 'basicInfo' | 'projectDetails'>

const makeResource = (overrides: Partial<ResourceModules> = {}): ResourceModules => ({
  status: 'draft',
  basicInfo: completeBasicInfo,
  projectDetails: completeProjectDetails,
  ...overrides,
})

describe('isBasicInfoComplete', () => {
  it('is true when every field holds a value', () => {
    expect(isBasicInfoComplete(completeBasicInfo)).toBe(true)
  })

  it.each(Object.keys(completeBasicInfo) as (keyof BasicInfo)[])(
    'is false when %s is empty',
    (field) => {
      expect(isBasicInfoComplete({ ...completeBasicInfo, [field]: '' })).toBe(false)
    },
  )

  it('is false right after creation, when only the resource name is filled', () => {
    expect(isBasicInfoComplete(emptyBasicInfo)).toBe(false)
  })
})

describe('isProjectDetailsComplete', () => {
  it('is true when every field holds a value', () => {
    expect(isProjectDetailsComplete(completeProjectDetails)).toBe(true)
  })

  it.each(['projectName', 'budget', 'category'] as const)('is false when %s is empty', (field) => {
    expect(isProjectDetailsComplete({ ...completeProjectDetails, [field]: '' })).toBe(false)
  })

  it('is false without team members', () => {
    expect(isProjectDetailsComplete({ ...completeProjectDetails, options: [] })).toBe(false)
  })
})

describe('getModuleState', () => {
  it('locks Project Details of a Draft until Basic Info is complete', () => {
    const resource = makeResource({ basicInfo: emptyBasicInfo, projectDetails: emptyProjectDetails })
    expect(getModuleState(resource, 'projectDetails')).toBe('locked')
  })

  it('unlocks Project Details as incomplete once Basic Info is complete', () => {
    const resource = makeResource({ projectDetails: emptyProjectDetails })
    expect(getModuleState(resource, 'projectDetails')).toBe('incomplete')
  })

  it('never locks Basic Info', () => {
    const resource = makeResource({ basicInfo: emptyBasicInfo })
    expect(getModuleState(resource, 'basicInfo')).toBe('incomplete')
  })

  it('never locks a Completed resource', () => {
    const resource = makeResource({ status: 'completed', basicInfo: emptyBasicInfo })
    expect(getModuleState(resource, 'projectDetails')).not.toBe('locked')
  })

  it.each(['basicInfo', 'projectDetails'] as const)('reports complete %s', (module) => {
    expect(getModuleState(makeResource(), module)).toBe('complete')
  })
})

describe('getModuleProgress', () => {
  it.each([
    [0, { basicInfo: emptyBasicInfo, projectDetails: emptyProjectDetails }],
    [1, { projectDetails: emptyProjectDetails }],
    [2, {}],
  ] as const)('counts %i complete modules', (expected, overrides) => {
    expect(getModuleProgress(makeResource(overrides))).toBe(expected)
  })
})

describe('canProvision', () => {
  it('allows a Draft with both modules complete', () => {
    expect(canProvision(makeResource())).toBe(true)
  })

  it('rejects a Draft with only Basic Info complete', () => {
    expect(canProvision(makeResource({ projectDetails: emptyProjectDetails }))).toBe(false)
  })

  it('rejects a Draft with incomplete modules', () => {
    const resource = makeResource({ basicInfo: emptyBasicInfo, projectDetails: emptyProjectDetails })
    expect(canProvision(resource)).toBe(false)
  })

  it('rejects provisioning a Completed resource again', () => {
    expect(canProvision(makeResource({ status: 'completed' }))).toBe(false)
  })
})
