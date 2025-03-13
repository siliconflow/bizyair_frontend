import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  // 默认语言
  const locale = ref(localStorage.getItem('locale') || 'en')

  // 切换语言
  const setLocale = (lang: string) => {
    locale.value = lang
    localStorage.setItem('locale', lang)
  }

  return {
    locale,
    setLocale
  }
}) 