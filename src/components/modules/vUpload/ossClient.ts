import OSS from 'ali-oss'
import { calculateHash } from './computeHash'
import { oss_sign } from '@/api/public'

export async function creatClient(file: File | Blob, type: string) {
  const { sha256sum, md5Hash } = await calculateHash(file)
  let { data } = await oss_sign(sha256sum, type)
  if (data.file.id) {
    return {
      sha256sum,
      fileId: data.file.id
    }
  }
  
  const accessKeyId = data.file.access_key_id
  const accessKeySecret = data.file.access_key_secret
  const bucket = data.storage.bucket
  const stsToken = data.file.security_token
  const region = data.storage.region

  return {
    oss: new OSS({
      accessKeyId,
      accessKeySecret,
      stsToken,
      bucket,
      region,
      secure: true
    }),
    objectKey: data.file.object_key,
    md5Hash,
    sha256sum
  }
}