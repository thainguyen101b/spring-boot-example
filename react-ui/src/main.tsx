import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './user-context.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import LoginError from './login-error.tsx'

const router = createBrowserRouter(
  [
    {
      index: true,
      Component: App,
    },
    {
      path: 'login-error',
      Component: LoginError
    }
  ],
  { basename: '/ui' }
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
)
