import { useSearchParams } from 'react-router'

export default function LoginError() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error') || ''
  
  return <div>
      <h1>OAuth2 Login Error</h1>
      <p><strong>Error Detail:</strong> {error}</p>
    </div>
}
