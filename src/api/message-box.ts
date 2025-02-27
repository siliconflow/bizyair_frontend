import { customFetch } from '@/utils/customFetch'

export const get_messages_list = (params: any) => {
  const searchParams = new URLSearchParams()

  // 处理普通参数
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'types' && value !== undefined) {
      searchParams.append(key, String(value))
    }
  })

  // 特殊处理 types 数组
  // if (params.types && Array.isArray(params.types)) {
  //   params.types.forEach((type: any) => {
  //     searchParams.append('types', String(type))
  //   })
  // }
  console.log('params.types', params.types)
  if (params.types && (typeof params.types === 'string' || typeof params.types === 'number')) {
    searchParams.append('types', params.types)
  }

  return customFetch(`/bizyair/community/notifications?${searchParams.toString()}`, {
    method: 'GET'
  })
}

export const get_message_unread_count = () =>
  customFetch(`/bizyair/community/notifications/unread_count`, {
    method: 'GET'
  })

export const read_message = (id:  number) =>
  customFetch(`/bizyair/community/notifications/read`, {
    method: 'POST',
    body: JSON.stringify({
      ids: [id]
    })
  })

export const read_all_message = () =>
  customFetch(`/bizyair/community/notifications/read_all`, {
    method: 'POST'
  })
