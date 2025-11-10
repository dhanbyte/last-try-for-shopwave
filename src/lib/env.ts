export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return 'http://localhost:3000'
}

export const apiUrl = (path: string) => {
  const base = getBaseUrl()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}