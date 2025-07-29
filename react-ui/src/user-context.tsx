import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import api from './axios'

type User = {
  username: string
  email: string
  roles: string[]
  exp: number
}

type UserContextType = {
  user: User | null,
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let refreshTimeout: ReturnType<typeof setTimeout>

    const refresh = async () => {
      try {
        const res = await api.get<User>('/bff/api/me')
        const data = res.data
        setUser(data?.username ? data : null)

        if (data.exp) {
          const now = Date.now()
          const delay = (data.exp * 1000 - now) * 0.8
          if (delay > 2000) {
            refreshTimeout = setTimeout(() => refresh(), delay)
          }
        }
      } catch (err) {
        console.error('Failed to refresh user:', err)
        setUser(null)
      }
    }

    refresh()

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
    }
  }, [])


  return (
    <UserContext.Provider
      value={{
        user
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
