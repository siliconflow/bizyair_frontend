/**
 * BizyAir 语言切换器
 * 在window对象上提供语言切换功能
 * 使用现有的 put_user_language_profile API
 * 与Vue i18n系统集成
 */

import { get_user_language_profile, put_user_language_profile } from '@/api/user'

class LanguageSwitcher {
  constructor() {
    this.currentLanguage = 'zh'
    this.availableLanguages = ['en', 'zh']
    this.callbacks = []
    this.isInitialized = false
    this.vueI18n = null
    this.languageStore = null
  }

  /**
   * 初始化语言切换器
   * @param {Object} vueI18n - Vue i18n实例
   * @param {Object} languageStore - 语言Store实例
   */
  async init(vueI18n = null, languageStore = null) {
    if (this.isInitialized) return

    this.vueI18n = vueI18n
    this.languageStore = languageStore

    try {
      await this.loadCurrentLanguage()
      this.isInitialized = true
      console.log('BizyAir 语言切换器初始化成功')
    } catch (error) {
      console.warn('语言切换器初始化失败，使用默认设置:', error)
      this.isInitialized = true
    }
  }

  /**
   * 从API加载当前语言设置
   */
  async loadCurrentLanguage() {
    try {
      const response = await get_user_language_profile()
      if (response.data?.global?.lang) {
        this.currentLanguage = response.data.global.lang
      }
    } catch (error) {
      console.warn('无法加载当前语言设置:', error)
      // 从localStorage获取备用设置
      const savedLang = localStorage.getItem('locale') || localStorage.getItem('bizyair_language')
      if (savedLang && this.availableLanguages.includes(savedLang)) {
        this.currentLanguage = savedLang
      }
    }

    // 如果有Vue i18n实例，同步当前语言
    if (this.vueI18n && this.vueI18n.global) {
      this.currentLanguage = this.vueI18n.global.locale.value || this.currentLanguage
    }

    // 如果有语言Store，同步当前语言
    if (this.languageStore) {
      this.currentLanguage = this.languageStore.locale || this.currentLanguage
    }
  }

  /**
   * 切换语言
   * @param {string} language - 要切换到的语言代码
   */
  async switchLanguage(language) {
    if (!language) {
      throw new Error('语言代码不能为空')
    }

    if (!this.availableLanguages.includes(language)) {
      throw new Error(`不支持的语言代码: ${language}`)
    }

    const previousLanguage = this.currentLanguage

    try {
      // 使用API保存语言设置
      await put_user_language_profile({
        global: {
          lang: language
        }
      })

      // 更新本地状态
      this.currentLanguage = language

      // 更新Vue i18n
      if (this.vueI18n && this.vueI18n.global) {
        this.vueI18n.global.locale.value = language
      }

      // 更新语言Store
      if (this.languageStore && this.languageStore.setLocale) {
        this.languageStore.setLocale(language)
      }

      // 保存到localStorage
      localStorage.setItem('locale', language)
      localStorage.setItem('bizyair_language', language)

      // 触发语言变更回调
      this.triggerCallbacks(previousLanguage, this.currentLanguage)

      return {
        success: true,
        previousLanguage: previousLanguage,
        currentLanguage: this.currentLanguage,
        message: `Language switched to ${language}`
      }
    } catch (error) {
      console.error('语言切换失败:', error)

      // 如果API失败，仍然尝试更新前端状态
      try {
        this.currentLanguage = language

        // 更新Vue i18n
        if (this.vueI18n && this.vueI18n.global) {
          this.vueI18n.global.locale.value = language
        }

        // 更新语言Store
        if (this.languageStore && this.languageStore.setLocale) {
          this.languageStore.setLocale(language)
        }

        // 保存到localStorage
        localStorage.setItem('locale', language)
        localStorage.setItem('bizyair_language', language)

        // 触发语言变更回调
        this.triggerCallbacks(previousLanguage, this.currentLanguage)

        return {
          success: true,
          previousLanguage: previousLanguage,
          currentLanguage: this.currentLanguage,
          message: `Language switched to ${language} (frontend only)`,
          warning: 'API调用失败，仅更新了前端状态'
        }
      } catch (frontendError) {
        console.error('前端语言切换也失败:', frontendError)
        throw error
      }
    }
  }

  /**
   * 获取当前语言
   * @returns {string} 当前语言代码
   */
  getCurrentLanguage() {
    return this.currentLanguage
  }

  /**
   * 获取可用语言列表
   * @returns {Array} 可用语言代码数组
   */
  getAvailableLanguages() {
    return [...this.availableLanguages]
  }

  /**
   * 添加语言变更回调函数
   * @param {Function} callback - 回调函数，接收 (previousLang, currentLang) 参数
   */
  onLanguageChange(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback)
    }
  }

  /**
   * 移除语言变更回调函数
   * @param {Function} callback - 要移除的回调函数
   */
  offLanguageChange(callback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  /**
   * 触发所有语言变更回调
   * @param {string} previousLang - 之前的语言
   * @param {string} currentLang - 当前语言
   */
  triggerCallbacks(previousLang, currentLang) {
    this.callbacks.forEach(callback => {
      try {
        callback(previousLang, currentLang)
      } catch (error) {
        console.error('语言变更回调执行失败:', error)
      }
    })
  }

  /**
   * 切换到下一个可用语言
   */
  async switchToNextLanguage() {
    const currentIndex = this.availableLanguages.indexOf(this.currentLanguage)
    const nextIndex = (currentIndex + 1) % this.availableLanguages.length
    const nextLanguage = this.availableLanguages[nextIndex]
    return await this.switchLanguage(nextLanguage)
  }

  /**
   * 获取语言的显示名称
   * @param {string} langCode - 语言代码
   * @returns {string} 语言显示名称
   */
  getLanguageDisplayName(langCode) {
    const displayNames = {
      en: 'English',
      zh: '中文'
    }
    return displayNames[langCode] || langCode
  }
}

// 创建单例实例
const languageSwitcher = new LanguageSwitcher()

// 将语言切换器绑定到window对象
window.languageSwitcher = languageSwitcher

// 提供简化的全局函数
window.switchLanguage = function (language) {
  return languageSwitcher.switchLanguage(language)
}

window.getCurrentLanguage = function () {
  return languageSwitcher.getCurrentLanguage()
}

window.getAvailableLanguages = function () {
  return languageSwitcher.getAvailableLanguages()
}

window.switchToNextLanguage = function () {
  return languageSwitcher.switchToNextLanguage()
}

window.getLanguageDisplayName = function (langCode) {
  return languageSwitcher.getLanguageDisplayName(langCode)
}

window.onLanguageChange = function (callback) {
  return languageSwitcher.onLanguageChange(callback)
}

window.offLanguageChange = function (callback) {
  return languageSwitcher.offLanguageChange(callback)
}

// 导出语言切换器实例
export default languageSwitcher
