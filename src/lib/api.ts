import { getBaseUrl } from './env'

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}