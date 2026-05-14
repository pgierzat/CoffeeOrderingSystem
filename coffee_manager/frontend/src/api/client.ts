import { Api } from './api'

export const api = new Api({
  baseURL: 'http://localhost:8000',
  securityWorker: (token) =>
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
})

const stored = localStorage.getItem('auth_token')
if (stored) api.setSecurityData(stored)
