import { ref, Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToaster } from '@/components/modules/toats/index'
import { MAX_RETRY_COUNT, RETRY_INTERVALS } from './constants'
import { UploadData, RetryTimeout } from './types'
import { isNetworkError } from './utils'

export function useRetry(
  emitFn: Function,
  doUploadFn: (data: UploadData) => Promise<any>,
  handleSuccessFn: (data: UploadData) => Promise<void>,
  disableUploadRef: Ref<boolean>
) {
  const { t } = useI18n()

  const retryTimer = ref<number | null>(null)
  const retryCount = ref(0)
  const isRetrying = ref(false)
  const retryTimeoutInSeconds = ref(0)

  const resetRetryState = () => {
    if (retryTimer.value) {
      clearTimeout(retryTimer.value)
      retryTimer.value = null
    }
    retryCount.value = 0
    isRetrying.value = false
    retryTimeoutInSeconds.value = 0
  }

  const getRetryTimeout = (): RetryTimeout => {
    let timeout = 0
    let seconds = 0

    if (retryCount.value === 1) {
      timeout = RETRY_INTERVALS.FIRST
      seconds = timeout / 1000
    } else if (retryCount.value === 2) {
      timeout = RETRY_INTERVALS.SECOND
      seconds = timeout / 1000
    } else if (retryCount.value === 3) {
      timeout = RETRY_INTERVALS.THIRD
      seconds = timeout / 1000
    }

    return { timeout, seconds }
  }

  const startCountdownUpdate = (data: UploadData, seconds: number) => {
    retryTimeoutInSeconds.value = seconds

    const updateInterval = setInterval(() => {
      retryTimeoutInSeconds.value--
      if (retryTimeoutInSeconds.value <= 0) {
        clearInterval(updateInterval)
      } else {
        emitFn('uploadInfo', {
          fileName: data.file.name,
          speed: '',
          status: t('vUpload.retrying', {
            count: retryCount.value,
            seconds: retryTimeoutInSeconds.value
          })
        })
      }
    }, 1000)

    return updateInterval
  }

  const executeRetry = async (data: UploadData, originalError: any) => {
    try {
      const isOnline = navigator.onLine
      if (!isOnline) {
        setupAutoRetry(data, originalError)
        return
      }

      useToaster.success(t('vUpload.retryingUpload'))
      isRetrying.value = true
      disableUploadRef.value = true

      const result = await doUploadFn({
        ...data,
        autoRetry: true
      })

      if (result && result.res && result.res.status === 200) {
        await handleSuccessFn(data)
      }
    } catch (error) {
      console.error('重试上传失败', error)
      const errorStr = error?.toString() || ''

      if (isNetworkError(errorStr)) {
        setupAutoRetry(data, error)
      } else {
        useToaster.error(t('vUpload.retryFailed'))
        isRetrying.value = false
        emitFn('error')
        disableUploadRef.value = false
        emitFn('progress', '')
      }
    }
  }

  const setupAutoRetry = (data: UploadData, networkError: any) => {
    if (retryTimer.value) {
      clearTimeout(retryTimer.value)
      retryTimer.value = null
    }

    retryCount.value++

    if (retryCount.value > MAX_RETRY_COUNT) {
      useToaster.error(t('vUpload.retryFailed'))
      isRetrying.value = false
      emitFn('error')
      disableUploadRef.value = false
      emitFn('progress', '')
      return
    }

    const { timeout, seconds } = getRetryTimeout()

    console.log(`网络错误，将在${seconds}秒后进行第${retryCount.value}次重试`, networkError)
    useToaster.warning(t('vUpload.willRetryInSeconds', { seconds }))

    isRetrying.value = true
    emitFn('uploadInfo', {
      fileName: data.file.name,
      speed: '',
      status: t('vUpload.retrying', { count: retryCount.value, seconds })
    })

    const updateInterval = startCountdownUpdate(data, seconds)

    retryTimer.value = window.setTimeout(async () => {
      clearInterval(updateInterval)
      retryTimer.value = null

      await executeRetry(data, networkError)
    }, timeout)
  }

  return {
    retryTimer,
    retryCount,
    isRetrying,
    retryTimeoutInSeconds,
    resetRetryState,
    setupAutoRetry
  }
}
