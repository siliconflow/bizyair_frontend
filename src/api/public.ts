import { customFetch } from '@/utils/customFetch'

export const upload_image = (file: string | Blob) => {
  const formData = new FormData()
  formData.append('file', file)
  return customFetch('/bizyair/community/files/upload', {
    method: 'POST',
    body: formData
  })
}

export const oss_sign = (sha256: string, type: string) => {
  return customFetch(`/bizyair/community/sign?sha256sum=${sha256}&type=${type}`, { method: 'GET' })
}

export const oss_upload_token = (filename: string, type: string) => {
  return customFetch(`/bizyair/community/upload_token?filename=${filename}&type=${type}`, { method: 'GET' })
}
