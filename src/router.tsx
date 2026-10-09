import { createBrowserRouter, Navigate } from 'react-router-dom'
import { BasicInfoPage } from './resources/pages/BasicInfoPage'
import { ProjectDetailsPage } from './resources/pages/ProjectDetailsPage'
import { ResourceDetailsPage } from './resources/pages/ResourceDetailsPage'
import { ResourceListPage } from './resources/pages/ResourceListPage'
import { ResourceOverviewPage } from './resources/pages/ResourceOverviewPage'
import { AppLayout } from './shared/components/AppLayout'
import { NotFoundPage } from './shared/components/NotFoundPage'

// A data router is required for useBlocker (unsaved-changes guard).
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/resources" replace /> },
      { path: 'resources', element: <ResourceListPage /> },
      { path: 'resources/:resourceId', element: <ResourceOverviewPage /> },
      { path: 'resources/:resourceId/details', element: <ResourceDetailsPage /> },
      { path: 'resources/:resourceId/basic-info', element: <BasicInfoPage /> },
      { path: 'resources/:resourceId/project-details', element: <ProjectDetailsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
