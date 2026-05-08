import { createBrowserRouter, redirect } from 'react-router'
import { api, ApiError } from './lib/api'
import { Layout } from './routes/_layout'
import { LoginPage } from './routes/login'
import { IndexPage, indexLoader } from './routes/index'
import { NewPage } from './routes/new'
import { LinkDetailPage, linkDetailLoader } from './routes/link-detail'
import { SettingsPage, settingsLoader } from './routes/settings'

async function requireAuth() {
  try {
    await api.get<{ ok: boolean }>('/api/auth/me')
    return null
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      throw redirect('/login')
    }
    throw e
  }
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: 'login', element: <LoginPage /> },
        {
          path: '',
          loader: async () => {
            await requireAuth()
            return await indexLoader()
          },
          element: <IndexPage />,
        },
        {
          path: 'new',
          loader: async () => {
            await requireAuth()
            return null
          },
          element: <NewPage />,
        },
        {
          path: 'links/:slug',
          loader: async ({ params }) => {
            await requireAuth()
            return await linkDetailLoader(params.slug!)
          },
          element: <LinkDetailPage />,
        },
        {
          path: 'settings',
          loader: async () => {
            await requireAuth()
            return await settingsLoader()
          },
          element: <SettingsPage />,
        },
      ],
    },
  ],
  { basename: '/admin' },
)
