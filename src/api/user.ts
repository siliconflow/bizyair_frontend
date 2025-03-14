import { customFetch } from '@/utils/customFetch'

const host = `${window.location.origin}${window.location.pathname === '/' ? '' : window.location.pathname}`
export const set_api_key = (data: any) =>
  fetch(`${host}/bizyair/set_api_key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
  })

export const get_user_info = () => customFetch('/bizyair/user/info?v=1', { method: 'get' })

export const put_share_id = (data: any) =>
  customFetch('/bizyair/user/share_id', {
    method: 'put',
    body: JSON.stringify(data)
  })

export const get_user_language_profile = () => customFetch('/bizyair/user/profile', { method: 'get' })

export const put_user_language_profile = (data: any) => customFetch('/bizyair/user/profile', {
  method: 'put',
  body: JSON.stringify(data)
})



