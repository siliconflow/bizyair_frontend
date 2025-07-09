export const objectToArray = (obj: any) => {
  return Object.keys(obj).map(key => ({ name: key, value: obj[key] }))
}

export function sliceString(str: string, maxWidth: number): string {
  if (!str) return ''

  let width = 0
  let result = ''

  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const charWidth = /[\u4e00-\u9fa5\uFF00-\uFFFF]/.test(char) ? 2 : 1

    if (width + charWidth > maxWidth) {
      return result + '...'
    }

    width += charWidth
    result += char
  }

  return result
}

export const formatNumber = (num: number | undefined) => {
  if (!num) {
    return '0'
  }
  if (num < 1000) {
    return num.toString()
  }
  if (num < 10000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return (num / 10000).toFixed(1) + 'w'
}

/**
 * 将金额转换为合适的字符串表示
 * @param amount 金额数值
 * @returns 格式化后的字符串，例如：0=>0, 300=>300, 1200=>1200, 10001=>1w
 */
export const formatCoinAmount = (amount: number): string => {
  if (amount === 0) {
    return '0'
  }

  // 处理万级别
  if (amount >= 10000) {
    const w = amount / 10000.0
    // 使用 Math.floor 来处理小数位，避免四舍五入
    const intPart = parseInt(w.toString())
    const decimalPart = parseInt((w - intPart).toString())

    if (decimalPart === 0) {
      return `${intPart}w`
    }
    return `${(intPart + decimalPart).toFixed(1)}w`
  }

  // 小于10000直接返回数字
  return `${amount}`
}

export const formatSize = (size: number | undefined) => {
  if (!size) {
    return '-'
  }

  const KB = 1024
  const MB = KB * 1024
  const GB = MB * 1024

  if (size >= GB) {
    return (size / GB).toFixed(2) + 'G'
  } else if (size >= MB) {
    return (size / MB).toFixed(2) + 'MB'
  } else if (size >= KB) {
    return (size / KB).toFixed(2) + 'KB'
  } else {
    return size.toFixed(2) + 'B'
  }
}

interface StorageData<T> {
  value: T
  expires?: number
}

export const setLocalStorage = <T>(key: string, value: T, expires?: number): void => {
  const data: StorageData<T> = {
    value,
    expires: expires ? Date.now() + expires : undefined
  }
  localStorage.setItem(key, JSON.stringify(data))
}

export const getLocalStorage = <T>(key: string): T | null => {
  const item = localStorage.getItem(key)
  if (!item) return null

  try {
    const data: StorageData<T> = JSON.parse(item)
    if (data.expires && Date.now() > data.expires) {
      localStorage.removeItem(key)
      return null
    }

    return data.value
  } catch (error) {
    console.error('Error parsing localStorage item:', error)
    return null
  }
}

import { CommonDict } from '@/types/commonDict'

export const getDictData = <K extends keyof CommonDict>(
  key: string,
  field: K
): CommonDict[K] | null => {
  const data = getLocalStorage<CommonDict>(key)
  if (!data) return null
  return data[field]
}

export const setDictData = (key: string, data: CommonDict, expires?: number): void => {
  setLocalStorage<CommonDict>(key, data, expires)
}

/**
 * 下载图片工具函数
 * @param imageSrc 图片源URL或base64
 * @param fileName 可选的文件名，默认使用时间戳
 * @returns Promise<boolean> 下载是否成功
 */
export const downloadImage = async (imageSrc: string, fileName?: string): Promise<boolean> => {
  if (!imageSrc) return false
    // 创建一个临时链接
    const a = document.createElement('a')
    
    // 如果是base64格式
    if (imageSrc.startsWith('data:')) {
      a.href = imageSrc
    } else {
      // 如果是URL，需要先获取图片内容
      const response = await fetch(imageSrc)
      const blob = await response.blob()
      a.href = URL.createObjectURL(blob)
    }
    
    // 设置下载文件名
    a.download = fileName || `bizyair-image-${Date.now()}.png`
    
    // 触发点击下载
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    return true
}
