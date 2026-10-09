import { create } from 'zustand'
import type { BasicInfo, ProjectDetails, Resource, ResourcePayload } from '../api/schemas'
import type { ModuleKey } from './constants'

/**
 * Edit Buffer: unsubmitted Module changes to Completed Resources (see CONTEXT.md, ADR 0001).
 * Deliberately in memory only — no `persist` — so it is lost on refresh or close.
 */

interface ModuleData {
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
}

export type EditBufferEntry = Partial<ModuleData>

interface EditBufferState {
  buffers: Record<number, EditBufferEntry>
  /** Keeps a Module's changes; a Module equal to the saved data is dropped from the buffer. */
  keepModule: <K extends ModuleKey>(
    resourceId: number,
    module: K,
    data: ModuleData[K],
    saved: ModuleData[K],
  ) => void
  clear: (resourceId: number) => void
}

export const isSameModuleData = <T extends object>(a: T, b: T) =>
  (Object.keys(a) as (keyof T)[]).every(
    (key) => JSON.stringify(a[key]) === JSON.stringify(b[key]),
  )

export const useEditBufferStore = create<EditBufferState>()((set) => ({
  buffers: {},
  keepModule: (resourceId, module, data, saved) =>
    set((state) => {
      const entry: EditBufferEntry = { ...state.buffers[resourceId] }
      if (isSameModuleData(data, saved)) {
        delete entry[module]
      } else {
        entry[module] = data
      }

      const buffers = { ...state.buffers }
      if (Object.keys(entry).length === 0) {
        delete buffers[resourceId]
      } else {
        buffers[resourceId] = entry
      }
      return { buffers }
    }),
  clear: (resourceId) =>
    set((state) => {
      const buffers = { ...state.buffers }
      delete buffers[resourceId]
      return { buffers }
    }),
}))

export const useEditBuffer = (resourceId: number): EditBufferEntry | undefined =>
  useEditBufferStore((state) => state.buffers[resourceId])

export const useHasUnsubmittedChanges = (resourceId: number): boolean =>
  useEditBufferStore((state) => resourceId in state.buffers)

/** Body of the Submit Changes `PUT`: saved data overlaid with the buffer; the name never changes. */
export function buildReplacePayload(
  resource: Resource,
  entry: EditBufferEntry,
): ResourcePayload {
  return {
    name: resource.name,
    basicInfo: {
      ...(entry.basicInfo ?? resource.basicInfo),
      resourceName: resource.basicInfo.resourceName,
    },
    projectDetails: entry.projectDetails ?? resource.projectDetails,
  }
}
