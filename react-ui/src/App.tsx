import { useEffect, useState, type FormEvent } from 'react'
import { useUser } from './user-context'
import api from './axios'

function App() {
  const { user } = useUser()
  const [loginUri, setLoginUri] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get('/bff/login-options')
        const options = res.data
        if (options?.length && options[0].loginUri) {
          setLoginUri(options[0].loginUri)
        }
      } catch (err) {
        console.error('Failed to fetch login options', err)
      }
    })()
  }, [])

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!loginUri) return

    const url = new URL(loginUri)
    const baseUri = import.meta.env.VITE_BASE_URI

    const successUri = new URL(location.pathname, baseUri).toString()
    url.searchParams.append('post_login_success_uri', successUri)
    url.searchParams.append('post_login_failure_uri', `${baseUri}/login-error`)

    window.location.href = url.toString()
  }

  const handleLogout = async () => {
    try {
      const res = await api.post(
        '/bff/logout',
        {},
        {
          headers: {
            'X-POST-LOGOUT-SUCCESS-URI': import.meta.env.VITE_BASE_URI,
          },
        }
      )
      window.location.href = res.headers['location']
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return (
    <section>
      {!user?.username ? (
        <form onSubmit={handleLoginSubmit}>
          <button type="submit">Login</button>
        </form>
      ) : (
        <div>
          <div>
            Hi {user.username}! <button onClick={handleLogout}>Logout</button>
          </div>
          <pre>
            {JSON.stringify(user)}
          </pre>
        </div>
      )}
    </section>
  )
}

export default App
