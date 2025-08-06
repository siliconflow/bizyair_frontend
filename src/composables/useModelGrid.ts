import { ref, watch, isRef, computed } from 'vue'
import type { GridState, UseModelGridOptions, UseModelGridReturn } from '@/types/grid'
import { useCommunityStore } from '@/stores/communityStore'
import { get_model_list } from '@/api/model'
import { useToaster } from '@/components/modules/toats'

export function useModelGrid({ pageKey }: UseModelGridOptions): UseModelGridReturn {
  const communityStore = useCommunityStore()

  const state: GridState = {
    loading: ref(false),
    isGridLoading: ref(false),
    cacheKey: ref(0),
    hasMore: ref(true),
    showSortPopover: ref(false),
    imageLoadStates: ref(new Map())
  }

  const getStoreData = () => {
    const key = isRef(pageKey) ? pageKey.value : pageKey
    if (key === 'posts' || key === 'forked') {
      return communityStore.mine[key]
    }
    return communityStore[key]
  }

  const updateMode = () => {
    const key = isRef(pageKey) ? pageKey.value : pageKey
    const storeData = getStoreData()

    switch (key) {
      case 'posts':
        storeData.modelListPathParams.mode = 'my'
        break
      case 'forked':
        storeData.modelListPathParams.mode = 'my_fork'
        break
      case 'quickStart':
        storeData.modelListPathParams.mode = 'official'
        break
      case 'mainContent':
        storeData.modelListPathParams.mode = 'publicity'
        break
      case 'workflows':
        storeData.modelListPathParams.mode = 'publicity'
        break
    }
  }

  const fetchData = async () => {
    try {
      updateMode()

      const storeData = getStoreData()
      console.log('+++++++++++++++++++fetchData+++++++++++++++++++')
      console.log(storeData.filterState)
      const response = await get_model_list(
        {
          ...storeData.modelListPathParams
        },
        {
          ...storeData.filterState
          // model_types: ['LoRA', 'Controlnet', 'Checkpoint'] // 添加你想要的模型类型
        }
      )

      if (response?.data?.list) {
        state.hasMore.value = storeData.models.length < response.data.total
        storeData.modelListPathParams.total = response.data.total || 0

        if (storeData.modelListPathParams.current === 1) {
          storeData.models = response.data.list
        } else {
          storeData.models = [...storeData.models, ...response.data.list]
        }
        return response.data.list
      } else {
        state.hasMore.value = false
        storeData.models = []
        return []
      }
    } catch (error) {
      console.error('Fetch data error:', error)
      useToaster.error(`Failed to fetch data: ${error}`)
      return []
    }
  }

  const loadMore = async () => {
    if (state.loading.value || !state.hasMore.value) return
    state.loading.value = true

    try {
      const storeData = getStoreData()
      const { current, page_size, total } = storeData.modelListPathParams

      if (current * page_size >= total) {
        state.hasMore.value = false
        return
      }

      storeData.modelListPathParams.current = current + 1
      await fetchData()
      state.hasMore.value = (current + 1) * page_size < total
    } catch (error) {
      console.error('Load more error:', error)
      useToaster.error(`Failed to load more: ${error}`)
    } finally {
      state.loading.value = false
    }
  }

  const doMetaFetch = async () => {
    const storeData = getStoreData()
    storeData.modelListPathParams.current = 1
    await fetchData()
  }

  const handleImageLoad = (_event: Event, modelId: number | string) => {
    const newMap = new Map(state.imageLoadStates.value)
    newMap.set(modelId, true)
    state.imageLoadStates.value = newMap
  }

  const handleImageError = (_event: Event, modelId: number | string) => {
    const newMap = new Map(state.imageLoadStates.value)
    newMap.set(modelId, false)
    state.imageLoadStates.value = newMap
  }

  if (isRef(pageKey)) {
    watch(pageKey, () => {
      state.cacheKey.value++
      state.imageLoadStates.value = new Map()
      doMetaFetch()
    })
  }

  const storeState = computed(() => getStoreData())

  return {
    state,
    storeState,
    fetchData,
    loadMore,
    doMetaFetch,
    handleImageLoad,
    handleImageError
  }
}
