import { defineStore } from 'pinia'
import { get_all_dict } from '@/api/model'
import { ModelTag } from '@/types/model'
import { setLocalStorage, getLocalStorage } from '@/utils/tool'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tagsMap: {} as Record<string | number, ModelTag>,
    tagsList: [] as ModelTag[],
    isLoading: false,
    retryCount: 0,
    maxRetries: 1,
    lastFetchTime: 0,
    cacheTimeout: 30 * 60 * 1000
  }),

  getters: {
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
    async fetchTags() {
      if (this.isLoading) return

      try {
        this.isLoading = true

        const cachedData = getLocalStorage<{ tags: ModelTag[] }>('dict_cache')

        let tagsData

        if (!cachedData || Date.now() - this.lastFetchTime >= this.cacheTimeout) {
          const res = await get_all_dict()

          if (!res.data || !Array.isArray(res.data.tags)) {
            console.error('Invalid tags data format:', res)
            return
          }

          tagsData = res.data.tags
          setLocalStorage('dict_cache', { tags: tagsData }, this.cacheTimeout)
        } else {
          tagsData = cachedData.tags
        }

        this.tagsList = [...tagsData]

        this.tagsMap = this.tagsList.reduce(
          (acc, tag) => {
            if (tag && tag.id) {
              acc[tag.id] = { ...tag }
            }
            return acc
          },
          {} as Record<string | number, ModelTag>
        )

        this.lastFetchTime = Date.now()
        this.retryCount = 0
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        this.isLoading = false
      }
    },

    async refreshTags() {
      this.lastFetchTime = 0
      await this.fetchTags()
    },

    async getTagWithRetry(id: string | number) {
      const tag = this.tagsMap[id]

      if (!tag && this.retryCount < this.maxRetries) {
        this.retryCount++
        await this.fetchTags()
        return this.tagsMap[id]
      }

      return tag
    },

    getHighestOrderTag(tagIds: (string | number)[]) {
      const matchedTags = this.tagsList
        .filter((tag: ModelTag) => tagIds.includes(tag.id))
        .sort((a: ModelTag, b: ModelTag) => b.order - a.order)
      return matchedTags[0] || null
    }
  }
})
