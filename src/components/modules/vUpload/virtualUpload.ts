import { commit_file } from '@/api/model'
import { creatClient } from './ossClient'
import { useShadet } from '@/components/modules/vShadet/index'

let calculatingDialog: any

export async function uploadFile(file: File, modelType: string, fn: (sha256sum: string) => void) {
  calculatingDialog = useShadet({
    content: 'In hash calculation',
    z: 'z-12000'
  })
  const { oss, objectKey, md5Hash, sha256sum, fileId } = await creatClient(file, modelType)
  calculatingDialog.close()

  if (fileId) {
    fn(sha256sum)
    return
  }

  let lastUploadedSize = 0
  let lastTime = performance.now()

  const completeResult = await oss?.multipartUpload(objectKey, file, {
    progress: (p: any) => {
      // onProgress(p)
      let speed: string = ''
      const now = performance.now()
      const uploadedSize = file.size * p
      const deltaSize = uploadedSize - lastUploadedSize
      const deltaTime = (now - lastTime) / 1000
      if (deltaTime > 0) {
        const speedInBytes = deltaSize / deltaTime
        if (speedInBytes >= 1024 * 1024) {
          speed = `${(speedInBytes / (1024 * 1024)).toFixed(2)} MB/s`
        } else {
          speed = `${(speedInBytes / 1024).toFixed(2)} KB/s`
        }
      }
      lastUploadedSize = uploadedSize
      lastTime = now
      console.log('speed', speed)
      // emit('uploadInfo', {
      //   speed,
      //   fileName: file.name
      // })
    },
    parallel: 2,
    partSize: 5 * 1024 * 1024
  })

  await commit_file({
    md5_hash: md5Hash,
    md5Hash,
    sha256sum,
    object_key: objectKey,
    type: modelType
  })
  fn(sha256sum)
  return completeResult
}
