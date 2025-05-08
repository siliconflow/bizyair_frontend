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
 * 提取分享码的方法。
 * 从文本中提取6-10位分享码，支持URL中code参数或路径，和直接输入的方式
 * @param text 包含分享码的文本
 * @returns 提取到的6-10位分享码或null
 */
export const extractShareCode = (text: string): string | null => {
  const trimmedText = text.trim();
  
  // 检测是否为URL
  if (trimmedText.startsWith('http://') || trimmedText.startsWith('https://')) {
      const url = new URL(trimmedText);
      // 从URL参数中提取code=xxxx
      const codeParam = url.searchParams.get('code');
      if (codeParam && codeParam.length >= 6 && codeParam.length <= 10 && /^[a-zA-Z0-9]{6,10}$/.test(codeParam)) return codeParam;
      
      // 从URL路径的最后一部分提取分享码
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      const lastPart = pathParts[pathParts.length - 1];
      
      // 检查最后一部分是否是6-10位分享码
      return lastPart && lastPart.length >= 6 && lastPart.length <= 10 && /^[a-zA-Z0-9]{6,10}$/.test(lastPart) ? lastPart : null;
   
  }
  // 检查是否为直接的6-10位分享码
  return trimmedText.length >= 6 && trimmedText.length <= 10 && /^[a-zA-Z0-9]{6,10}$/.test(trimmedText) ? trimmedText : null;
};
