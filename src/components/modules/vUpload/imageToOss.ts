import OSS from 'ali-oss'
import { oss_upload_token } from '@/api/public'
export function base64ToFile(base64: string, filename: string, mimeType: any): File {
  // 处理不同格式的 base64 数据
  let base64Data = base64
  let detectedMimeType = mimeType

  if (base64.includes(',')) {
    // 包含 data: 前缀的格式
    const parts = base64.split(',')
    base64Data = parts[1]
    if (!mimeType && parts[0].includes(':')) {
      // 从 data: 前缀中提取 MIME 类型
      detectedMimeType = parts[0].split(':')[1].split(';')[0]
    }
  }

  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: detectedMimeType || 'image/webp' })
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
  const { data } = await oss_upload_token(file.name, 'Image')
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
