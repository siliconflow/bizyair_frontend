import { STORAGE_KEY_PREFIX } from './constants'
import { UploadState } from './types'


export function preventDefaults(e: Event): void {
  e.preventDefault()
  e.stopPropagation()
}


export const isNetworkError = (errorStr: string): boolean => {
  return (
    errorStr.includes('Network Error') ||
    errorStr.includes('net::ERR') ||
    errorStr.includes('Failed to fetch') ||
    errorStr.includes('NetworkError') ||
    errorStr.includes('timeout') ||
    errorStr.includes('断开') ||
    errorStr.includes('network') ||
    errorStr.includes('network is offline') ||
    !navigator.onLine
  )
}


export const isCredentialExpired = (expiration?: string, safetyBuffer: number = 5 * 60 * 1000): boolean => {
  if (!expiration) return true
  
  try {
    
    const expirationTime = new Date(expiration).getTime()
    
    return Date.now() + safetyBuffer >= expirationTime
  } catch (e) {
    console.error('解析过期时间失败', e)
    return true 
  }
}


export const calculateSpeed = (
  currentSize: number, 
  lastSize: number, 
  deltaTime: number
): string => {
  let speed = ''
  
  if (deltaTime > 0) {
    const speedInBytes = (currentSize - lastSize) / deltaTime
    if (speedInBytes >= 1024 * 1024) {
      speed = `${(speedInBytes / (1024 * 1024)).toFixed(2)} MB/s`
    } else {
      speed = `${(speedInBytes / 1024).toFixed(2)} KB/s`
    }
  }
  
  return speed
}


export const saveUploadState = (
  data: Partial<UploadState>, 
  currentState: UploadState
): UploadState => {
  try {
    
    const updatedState = {
      ...currentState,
      ...data
    }
    
    
    const stateToSave = { ...updatedState }
    
    
    if (stateToSave.file) {
      stateToSave.fileName = stateToSave.file.name
      stateToSave.fileSize = stateToSave.file.size
      delete stateToSave.file
    }
    
    if (updatedState.sha256sum) {
      const key = `${STORAGE_KEY_PREFIX}${updatedState.sha256sum}`
      localStorage.setItem(key, JSON.stringify(stateToSave))
    }
    
    return updatedState
  } catch (e) {
    console.error('保存上传状态失败', e)
    return currentState
  }
}


export const getUploadState = (file: File, sha256sum: string): UploadState | null => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${sha256sum}`
    const savedState = localStorage.getItem(key)
    if (savedState) {
      const state = JSON.parse(savedState)
      
      if (state.fileName === file.name && state.fileSize === file.size) {
        return state
      } else {
        console.warn('文件名或大小不匹配，无法恢复上传')
        clearUploadState(sha256sum)
        return null
      }
    }
  } catch (e) {
    console.error('获取上传状态失败', e)
  }
  return null
}


export const clearUploadState = (sha256sum: string): void => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${sha256sum}`
    localStorage.removeItem(key)
  } catch (e) {
    console.error('清除上传状态失败', e)
  }
} 