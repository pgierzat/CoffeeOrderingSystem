import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Text, Button, TextInput } from '@tremor/react'

const VALID_KEY = 'cof_brzeskakawa_2024_x9k2'

export default function DistributorLogin() {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim() === VALID_KEY) {
      localStorage.setItem('dist_auth', apiKey)
      navigate('/distributor')
    } else {
      setError('Invalid API key')
    }
  }

  return (
    <div className="min-h-screen bg-tremor-background-muted dark:bg-dark-tremor-background flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">☕</span>
          <h1 className="mt-3 text-xl font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Distributor Portal
          </h1>
          <p className="text-sm text-tremor-content dark:text-dark-tremor-content mt-1">
            Sign in with your API key to manage your offer
          </p>
        </div>
        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-tremor-content dark:text-dark-tremor-content mb-1">
                API Key
              </label>
              <TextInput
                placeholder="Enter API key"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>
            {error && <Text className="text-red-500 text-sm">{error}</Text>}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </Card>
        <div className="text-center mt-4">
          <a
            href="/login"
            className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle hover:text-tremor-content dark:hover:text-dark-tremor-content transition-colors"
          >
            ← Coordinator panel
          </a>
        </div>
      </div>
    </div>
  )
}