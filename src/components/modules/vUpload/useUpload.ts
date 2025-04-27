import { ref, Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToaster } from '@/components/modules/toats/index'
import { useShadet } from '@/components/modules/vShadet/index'
import { commit_file } from '@/api/model'
import { creatClient } from './ossClient'
import OSS from 'ali-oss'
import { MULTIPART_UPLOAD_CONFIG } from './constants'
import { UploadData, UploadState } from './types'
import {
  calculateSpeed,
  clearUploadState,
  getUploadState,
  isCredentialExpired,
  isNetworkError,
  saveUploadState
} from './utils'
import { useRetry } from './useRetry'

export function useUpload(modelType: Ref<string | undefined>, emitFn: (event: string, payload?: any) => void) {
  const { t } = useI18n()

  const uploadState = ref<UploadState>({})
  const client = ref<any>(null)
  const progress = ref(0)
  const disableUpload = ref(false)
  const uploadSuccessful = ref(false)
  let calculatingDialog: any = null

  const onProgress = (p: number) => {
    progress.value = p || 0.0001
    emitFn('progress', Number((progress.value * 100).toFixed(2)))
  }

  const handleUploadSuccess = async (data: UploadData) => {
    retry.resetRetryState()

    await commit_file({
      md5_hash: data.md5Hash,
      md5Hash: data.md5Hash,
      sha256sum: data.sha256sum,
      object_key: data.objectKey,
      type: modelType.value || ''
    })

    emitFn('success', {
      sha256sum: data.sha256sum,
      object_key: data.objectKey
    })
    uploadSuccessful.value = true
    emitFn('uploadInfo', {
      fileName: data.file.name,
      speed: '',
      status: t('vUpload.uploadComplete')
    })

    if (data.sha256sum) {
      clearUploadState(data.sha256sum)
    }
  }

  const doUpload = async (data: UploadData) => {
    const { file, objectKey, retryLimit = 3, checkpoint, autoRetry = false } = data
    let lastUploadedSize = 0
    let lastTime = performance.now()

    try {
      const uploadOptions = {
        progress: (p: any, cpt: any, parts: any) => {
          onProgress(p)

          const now = performance.now()
          const uploadedSize = file.size * p
          const deltaTime = (now - lastTime) / 1000
          const speed = calculateSpeed(uploadedSize, lastUploadedSize, deltaTime)

          lastUploadedSize = uploadedSize
          lastTime = now

          if (cpt && data.sha256sum) {
            uploadState.value = saveUploadState(
              {
                checkpoint: cpt,
                uploadedParts: parts,
                objectKey: objectKey
              },
              uploadState.value
            )
          }

          emitFn('uploadInfo', {
            speed,
            fileName: file.name
          })
        },
        parallel: MULTIPART_UPLOAD_CONFIG.PARALLEL,
        partSize: MULTIPART_UPLOAD_CONFIG.PART_SIZE,
        checkpoint: checkpoint
      }

      if (!autoRetry) {
        retry.resetRetryState()
      }

      const completeResult = await client.value.multipartUpload(objectKey, file, uploadOptions)

      if (completeResult.res.status === 200 && data.sha256sum) {
        clearUploadState(data.sha256sum)

        retry.resetRetryState()
      }

      return completeResult
    } catch (e: any) {
      console.error('上传错误', e)

      const errorStr = e?.toString() || ''
      if (isNetworkError(errorStr) && data.sha256sum) {
        if (!autoRetry) {
          retry.setupAutoRetry(data, e)
          return { status: 'retrying' }
        }

        throw e
      }

      if (errorStr.includes('AccessDenied') || errorStr.includes('403')) {
        if (data.sha256sum) {
          e.isTokenExpired = true
        }
        throw e
      }

      if (e.name === 'cancel') {
        return e
      }

      if (retryLimit <= 0) {
        throw e
      } else {
        return await doUpload({
          ...data,
          retryLimit: retryLimit - 1,
          checkpoint: uploadState.value.checkpoint,
          uploadedParts: uploadState.value.uploadedParts
        })
      }
    }
  }

  const retry = useRetry(emitFn, doUpload, handleUploadSuccess, disableUpload)

  const interrupt = async () => {
    retry.resetRetryState()

    await client.value?.cancel()
    disableUpload.value = false
    uploadSuccessful.value = false
    emitFn('progress', 0)
  }

  const cancel = () => {
    retry.resetRetryState()

    if (uploadState.value.sha256sum) {
      clearUploadState(uploadState.value.sha256sum)
    }
    disableUpload.value = false
    uploadSuccessful.value = false
    emitFn('progress', 0)
  }

  const resumeUpload = async (file: File, state: UploadState) => {
    if (!file || !state.sha256sum || !state.checkpoint) {
      useToaster.error(t('vUpload.noResumeData'))
      return
    }

    emitFn('path', file.name)
    disableUpload.value = true

    try {
      let ossClient
      let currentObjectKey = state.objectKey || ''
      let useStoredCredentials = false

      if (state.accessKeyId && state.expiration && !isCredentialExpired(state.expiration)) {
        useStoredCredentials = true
        ossClient = new OSS({
          accessKeyId: state.accessKeyId,
          accessKeySecret: state.accessKeySecret || '',
          stsToken: state.stsToken || '',
          bucket: state.bucket || '',
          region: state.region || '',
          secure: true
        })

        console.log('使用保存的OSS凭证进行断点续传')
      } else {
        console.log('重新获取OSS凭证')
        calculatingDialog = useShadet({
          content: t('vUpload.inHashCalculation'),
          z: 'z-12000'
        })

        const response = await creatClient(file, modelType.value || '')

        calculatingDialog.close()

        if (response.credentials) {
          uploadState.value = saveUploadState(
            {
              accessKeyId: response.credentials.accessKeyId,
              accessKeySecret: response.credentials.accessKeySecret,
              stsToken: response.credentials.stsToken,
              bucket: response.credentials.bucket,
              region: response.credentials.region,
              expiration: response.credentials.expiration
            },
            uploadState.value
          )
        }

        if (response.fileId) {
          emitFn('success', { sha256sum: state.sha256sum, path: file.name })
          emitFn('uploadInfo', {
            fileName: file.name
          })
          emitFn('progress', 100)
          uploadSuccessful.value = true
          clearUploadState(state.sha256sum)
          return
        }

        ossClient = response.oss
        currentObjectKey = response.objectKey
      }

      client.value = ossClient
      emitFn('start')

      try {
        const result = await doUpload({
          client: ossClient,
          file,
          objectKey: currentObjectKey,
          md5Hash: state.md5Hash || '',
          sha256sum: state.sha256sum,
          checkpoint: state.checkpoint,
          uploadedParts: state.uploadedParts
        })

        if (result.status === 0) {
          return Promise.reject('')
        } else if (result.res.status === 200) {
          await handleUploadSuccess({
            client: ossClient,
            file,
            objectKey: currentObjectKey,
            md5Hash: state.md5Hash || '',
            sha256sum: state.sha256sum
          })
          return result.res
        }
      } catch (error: any) {
        const errorStr = error?.toString() || ''

        if (
          useStoredCredentials &&
          (errorStr.includes('AccessDenied') || errorStr.includes('403'))
        ) {
          console.log('保存的凭证无效，重新获取凭证并重试上传')

          uploadState.value = saveUploadState(
            {
              accessKeyId: undefined,
              accessKeySecret: undefined,
              stsToken: undefined,
              bucket: undefined,
              region: undefined,
              expiration: undefined
            },
            uploadState.value
          )

          return resumeUpload(file, uploadState.value)
        }

        throw error
      }
    } catch (error: any) {
      console.error('断点续传失败', error)
      const errorStr = error?.toString() || ''

      if (errorStr.includes('AccessDenied') || errorStr.includes('403')) {
        clearUploadState(state.sha256sum)
        useToaster.error(t('vUpload.tokenExpired'))

        disableUpload.value = false
        uploadFile(file)
        return
      }

      emitFn('error')
      disableUpload.value = false
      emitFn('progress', '')
      useToaster.error(t('vUpload.resumeFailed'))
    }
  }

  const uploadFile = async (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension) {
      useToaster.error(t('vUpload.invalidFileFormat'))
      return
    }

    emitFn('path', file.name)
    disableUpload.value = true

    calculatingDialog = useShadet({
      content: t('vUpload.inHashCalculation'),
      z: 'z-12000'
    })

    try {
      const response = await creatClient(file, modelType.value || '')

      calculatingDialog.close()

      const { oss, objectKey, md5Hash, sha256sum, fileId, credentials } = response

      if (fileId) {
        emitFn('success', { sha256sum, path: file.name })
        emitFn('uploadInfo', {
          fileName: file.name
        })
        emitFn('progress', 100)
        uploadSuccessful.value = true
        return
      }

      const savedState = getUploadState(file, sha256sum)
      if (savedState && savedState.checkpoint) {
        useToaster.success(t('vUpload.foundUnfinishedUpload'))

        uploadState.value = savedState
        uploadState.value.file = file

        await resumeUpload(file, savedState)
        return
      }

      uploadState.value = saveUploadState(
        {
          file,
          objectKey,
          md5Hash,
          sha256sum,

          accessKeyId: credentials?.accessKeyId,
          accessKeySecret: credentials?.accessKeySecret,
          stsToken: credentials?.stsToken,
          bucket: credentials?.bucket,
          region: credentials?.region,
          expiration: credentials?.expiration
        },
        uploadState.value
      )

      client.value = oss
      emitFn('start')

      try {
        const result = await doUpload({
          client: oss,
          file,
          objectKey,
          md5Hash,
          sha256sum
        })

        if (result.status === 0) {
          return Promise.reject('')
        } else if (result.res.status === 200) {
          await handleUploadSuccess({
            client: oss,
            file,
            objectKey,
            md5Hash,
            sha256sum
          })
          return result.res
        } else {
          emitFn('error')
          disableUpload.value = false
          uploadSuccessful.value = false
          emitFn('progress', '')
          throw new Error(`${t('vUpload.uploadFailed')}${result.res.statusText}`)
        }
      } catch (error: any) {
        console.error('上传出错', error)

        const errorStr = error?.toString() || ''
        if (errorStr.includes('AccessDenied') || errorStr.includes('403') || error.isTokenExpired) {
          clearUploadState(sha256sum)
          useToaster.error(t('vUpload.tokenExpired'))
        } else if (error.message) {
          useToaster.error(`${t('vUpload.uploadFailed')}${error.message}`)
        } else {
          useToaster.error(t('vUpload.uploadFailed'))
        }

        emitFn('error')
        disableUpload.value = false
        uploadSuccessful.value = false
        emitFn('progress', '')
      }
    } catch (error: any) {
      calculatingDialog?.close()
      console.error('创建客户端失败', error)
      useToaster.error(error.message || t('vUpload.uploadFailed'))
      disableUpload.value = false
    }
  }

  return {
    progress,
    disableUpload,
    uploadSuccessful,
    uploadState,
    ...retry,
    uploadFile,
    interrupt,
    cancel,
    resumeUpload
  }
}
