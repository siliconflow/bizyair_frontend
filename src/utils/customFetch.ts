import { useToaster } from '@/components/modules/toats/index'
import Cookies from 'js-cookie'

const fetchCache = new Map()

export function customFetch(url: string, options = {}, needDebounce = true, needError = true) {
  const now = Date.now()
  if (needDebounce) {
    if (fetchCache.has(url)) {
      const lastFetchTime = fetchCache.get(url)
      if (now - lastFetchTime < 1200) {
        return Promise.resolve(null)
      }
    }
    fetchCache.set(url, now)
  }

  // 添加自定义header
  const headers = {
    'Content-Type': 'application/json',
    Authorization: Cookies.get('bizy_token') || '',
    ...(options as any)?.headers
  }

  const updatedOptions = {
    ...options,
    headers
  }

  const host = `${window.location.origin}${window.location.pathname === '/' ? '' : window.location.pathname}`
  return window
    .fetch(`${host}${url}`, updatedOptions)
    .then(response => {
      if (response.status === 404) {
        useToaster.error(
          'You may be missing dependencies at the moment. For details, please refer to the ComfyUI logs.'
        )
      }
      return response.json()
    })
    .then(data => {
      const { code, message } = data
      if (code !== 20000) {
        if (needError) {
          if (fetchCache.has(message)) {
            const lastFetchTime = fetchCache.get(message)
            if (now - lastFetchTime < 2500) {
              return
            }
          }
          fetchCache.set(message, now)

          // 检查options中是否有shieldError字段，如果有，记录URL以确保同一URL的错误只提示一次
          const hasShieldError = options && (options as any).shieldError
          const errorCacheKey = `error_${url}`
          if (hasShieldError) {
            if (!fetchCache.has(errorCacheKey)) {
              fetchCache.set(errorCacheKey, true)
              useToaster.error(message)
            }
          } else {
            useToaster.error(message)
          }

          throw new Error(message)
        } else {
          return data
        }
        // return
      }
      return data
    })
    .catch(error => {
      console.error('Fetch error:', error)
      throw error
    })
}
