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

export const get_smetadata = () => customFetch('/bizyair/user/metadata', { method: 'GET' })
  
export const put_smetadata = (data: any) => customFetch('/bizyair/user/metadata', { 
  method: 'PUT', 
  body: JSON.stringify(data)
})  

export const post_real_name = () => customFetch('/bizyair/user/real_name', { method: 'POST'})

export const get_wallet = () => customFetch('/bizyair/user/wallet', { method: 'GET' })

export const get_coins = (param: any) => customFetch(`/bizyair/user/coins?${new URLSearchParams(param).toString()}`, { method: 'GET' })