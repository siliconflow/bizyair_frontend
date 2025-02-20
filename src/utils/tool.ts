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
  value: T;
  expires?: number;
}

export const setLocalStorage = <T>(key: string, value: T, expires?: number): void => {
  const data: StorageData<T> = {
    value,
    expires: expires ? Date.now() + expires : undefined
  };
  localStorage.setItem(key, JSON.stringify(data));
};

export const getLocalStorage = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const data: StorageData<T> = JSON.parse(item);
    if (data.expires && Date.now() > data.expires) {
      localStorage.removeItem(key);
      return null;
    }

    return data.value;
  } catch (error) {
    console.error('Error parsing localStorage item:', error);
    return null;
  }
};

import { CommonDict } from '@/types/commonDict'

export const getDictData = <K extends keyof CommonDict>(
  key: string,
  field: K
): CommonDict[K] | null => {
  const data = getLocalStorage<CommonDict>(key);
  if (!data) return null;
  return data[field];
};

export const setDictData = (
  key: string,
  data: CommonDict,
  expires?: number
): void => {
  setLocalStorage<CommonDict>(key, data, expires);
};



