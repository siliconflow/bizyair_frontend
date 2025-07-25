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

export const get_user_info = () => customFetch('/bizyair/user/info?v=1', { method: 'GET' })

export const put_share_id = (data: any) =>
  customFetch('/bizyair/user/share_id', {
    method: 'PUT',
    body: JSON.stringify(data)
  })

export const get_user_language_profile = () =>
  customFetch('/bizyair/user/profile', { method: 'get' })

export const put_user_language_profile = (data: any) =>
  customFetch('/bizyair/user/profile', {
    method: 'put',
    body: JSON.stringify(data)
  })

export const get_metadata = () => customFetch('/bizyair/user/metadata', { method: 'GET' })

export const put_metadata = (data: any) =>
  customFetch('/bizyair/user/metadata', {
    method: 'PUT',
    body: JSON.stringify(data)
  })

export const post_real_name = () => customFetch('/bizyair/user/real_name', { method: 'POST' })

export const get_wallet = () => customFetch('/bizyair/user/wallet', { method: 'GET' })

export const get_coins = (param: any) =>
  customFetch(`/bizyair/user/coins?${new URLSearchParams(param).toString()}`, { method: 'GET' })

export const logout = () => customFetch(`/bizyair/user/logout`, { method: 'POST' })

export const server_mode = () =>
  customFetch(`/bizyair/server_mode`, { method: 'GET' }, false, false)
