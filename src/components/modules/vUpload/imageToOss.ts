import OSS from 'ali-oss'
import { oss_upload_token } from '@/api/public'
export function base64ToFile(base64: string, filename: string, mimeType: any): File {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType || base64.split(':')[1].split(';')[0] })
  return new File([blob], filename, { type: blob.type })
}
export const formatToWebp = (file: File): Promise<{ file: File; base64: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const webpDataUrl = canvas.toDataURL('image/webp')
        resolve({
          file: base64ToFile(webpDataUrl, `${file.name}.webp`, 'image/webp'),
          base64: webpDataUrl
        })
      }
      img.src = e.target?.result as string
    }
    reader.onerror = e => {
      reject(e)
    }
    reader.readAsDataURL(file)
  })
}

export async function imageToOss(file: File) {
  const { data } = await oss_upload_token(file.name)
  const client = new OSS({
    accessKeyId: data.file.access_key_id,
    accessKeySecret: data.file.access_key_secret,
    stsToken: data.file.security_token,
    bucket: data.storage.bucket,
    region: data.storage.region,
    secure: true
  })
  const res = await client.put(data.file.object_key, file)

  return {
    url: res.url,
    ossTokenFile: data.file,
    ossTokenStorage: data.storage
  }
}
