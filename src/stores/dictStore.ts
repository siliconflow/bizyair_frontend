import { defineStore } from 'pinia'
import { get_all_dict } from '@/api/model'
import { ModelTag } from '@/types/model'
import { setLocalStorage, getLocalStorage } from '@/utils/tool'

export const useDictStore = defineStore('dict', {
  state: () => ({
    tagsMap: {} as Record<string | number, ModelTag>,
    dictData: {} as Record<string, any[]>,
    isLoading: false,
    retryCount: 0,
    maxRetries: 1,
    lastFetchTime: 0,
    cacheTimeout: 30 * 60 * 1000
  }),

  getters: {
    getDict: state => {
      return (dictType: string) => {
        return state.dictData[dictType] || []
      }
    },

    getTagById: state => {
      return (id: string | number) => state.tagsMap[id]
    },

    getTagLabelById: state => {
      return (id: string | number) => state.tagsMap[id]?.label || id
    },

    getTagClassById: state => {
      return (id: string | number) => state.tagsMap[id]?.class
    },

    getTag: state => {
      return (id: string | number) => {
        const tag = state.tagsMap[id]
        return tag ? { ...tag } : null
      }
    }
  },

  actions: {
    async fetchDictData() {
      if (this.isLoading) return

      try {
        this.isLoading = true

        const cachedData = getLocalStorage<Record<string, any[]>>('dict_cache')

        let dictData

        if (!cachedData || Date.now() - this.lastFetchTime >= this.cacheTimeout) {
          const res = await get_all_dict()

          if (!res.data) {
            console.error('Invalid dictionary data format:', res)
            return
          }

          dictData = res.data
          setLocalStorage('dict_cache', dictData, this.cacheTimeout)
        } else {
          dictData = cachedData
        }

        this.dictData = dictData

        if (Array.isArray(dictData.tags)) {
          this.tagsMap = dictData.tags.reduce(
            (acc, tag) => {
              if (tag && tag.id) {
                acc[tag.id] = { ...tag }
              }
              return acc
            },
            {} as Record<string | number, ModelTag>
          )
        }

        this.lastFetchTime = Date.now()
        this.retryCount = 0
      } catch (error) {
        console.error('Failed to fetch dictionary data:', error)
      } finally {
        this.isLoading = false
      }
    },

    async refreshDictData() {
      this.lastFetchTime = 0
      await this.fetchDictData()
    },

    async getTagWithRetry(id: string | number) {
      const tag = this.tagsMap[id]

      if (!tag && this.retryCount < this.maxRetries) {
        this.retryCount++
        await this.fetchDictData()
        return this.tagsMap[id]
      }

      return tag
    },

    getHighestOrderTag(tagIds: (string | number)[]) {
      const allTags = this.dictData.tags || []
      const matchedTags = allTags
        .filter((tag: ModelTag) => tagIds.includes(tag.id))
        .sort((a: ModelTag, b: ModelTag) => b.order - a.order)
      return matchedTags[0] || null
    }
  }
})
