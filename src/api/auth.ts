import { customFetch } from '@/utils/customFetch'

// 获取跳转官网的 temp_auth_token
export function get_plugin_tmp_token() {
  return customFetch('/bizyair/auth/plugin_tmp_token', {
    method: 'POST',
    credentials: 'include'
  })
}
