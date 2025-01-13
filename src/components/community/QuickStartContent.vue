<script setup lang="ts">
  import { ref, onMounted, nextTick, inject } from 'vue'
  import BaseModelGrid from './modules/BaseModelGrid.vue'
  import ModelFilterBar from './modules/ModelFilterBar.vue'
  import { useCommunityStore } from '@/stores/communityStore'

  import { get_model_list, get_workflow_dowload_url } from '@/api/model'
  import { useToaster } from '@/components/modules/toats'
  import { Model } from '@/types/model'

  defineOptions({
    name: 'QuickStartContent'
  })

  const communityStore = useCommunityStore()

  const loadingStates = ref({
    isGridLoading: false,
    isLoadingMore: false,
    isLoading: false,
    isManualLoading: false,
    isScrolling: false
  })

  const cacheState = ref({
    key: 0,
    grid: new Map(),
    loadedPages: new Set<number>(),
    imageLoadStates: new Map<number | string, boolean>()
  })

  const hasMore = ref(true)
  const showSortPopover = ref(false)

  const retryCountMap = ref(new Map<string, number>())
  const MAX_RETRY_COUNT = 3

  const comfyUIApp: any = inject('comfyUIApp')

  const handleLoadWorkflow = async (model: Model) => {
    try {
      if (!model.versions?.[0]) {
        useToaster.error('No workflow found')
        return
      }

      const workflow = await get_workflow_dowload_url(model.versions[0].id, model.versions[0].sign)

      if (workflow.data && comfyUIApp && comfyUIApp.graph) {
        comfyUIApp.graph.clear()
        await comfyUIApp.loadGraphData(workflow.data)
        communityStore.showDialog = false
        useToaster.success('Workflow loaded successfully')
      }
    } catch (error) {
      console.error('Failed to load workflow:', error)
      useToaster.error(`Failed to load workflow: ${error}`)
    }
  }

  const handleFilterChange = async () => {
    loadingStates.value.isGridLoading = true
    cacheState.value.key += 1

    try {
      communityStore.quickStart.modelListPathParams.current = 1
      communityStore.quickStart.models = []
      hasMore.value = true

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      await fetchData(0, communityStore.quickStart.modelListPathParams.page_size)
    } catch (error) {
      console.error('Filter change error:', error)
      useToaster.error(`Failed to filter models: ${error}`)
    } finally {
      setTimeout(() => {
        loadingStates.value.isGridLoading = false
      }, 300)
    }
  }

  const handleScroll = (e: Event) => {
    const container = e.target as HTMLElement
    const maxScroll = container.scrollHeight - container.clientHeight
    if (maxScroll > 0) {
      communityStore.quickStart.lastState = {
        currentPage: communityStore.quickStart.modelListPathParams.current,
        hasMore: hasMore.value,
        hasPrevious: true,
        loadedPages: Array.from(cacheState.value.loadedPages),
        scrollRatio: container.scrollTop / maxScroll,
        totalItems: communityStore.quickStart.modelListPathParams.total
      }
    }
  }

  const loadMore = async () => {
    if (loadingStates.value.isLoadingMore || !hasMore.value) return
    loadingStates.value.isLoadingMore = true

    try {
      const currentPage = communityStore.quickStart.modelListPathParams.current
      const pageSize = communityStore.quickStart.modelListPathParams.page_size
      const total = communityStore.quickStart.modelListPathParams.total

      if (currentPage * pageSize >= total) {
        hasMore.value = false
        return
      }

      communityStore.quickStart.modelListPathParams.current = currentPage + 1
      await fetchData(currentPage, pageSize)

      hasMore.value = (currentPage + 1) * pageSize < total
    } catch (error) {
      console.error('Load more error:', error)
      useToaster.error(`Failed to load more: ${error}`)
    } finally {
      loadingStates.value.isLoadingMore = false
    }
  }

  const scrollToTop = () => {
    const container = document.querySelector('.scroll-container')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const fetchData = async (pageNumber: number, pageSize: number): Promise<unknown[]> => {
    try {
      const response = await get_model_list(
        {
          ...communityStore.quickStart.modelListPathParams,
          current: pageNumber + 1,
          page_size: pageSize
        },
        communityStore.quickStart.filterState
      )

      if (response?.data?.list) {
        communityStore.quickStart.modelListPathParams.total = response.data.total || 0

        if (pageNumber === 0) {
          communityStore.quickStart.models = response.data.list
        } else {
          communityStore.quickStart.models = [
            ...communityStore.quickStart.models,
            ...response.data.list
          ]
        }

        return response.data.list
      }
      return []
    } catch (error) {
      console.error('Fetch data error:', error)
      useToaster.error(`Failed to fetch data: ${error}`)
      return []
    }
  }

  const restoreScrollPosition = () => {
    const scrollRatio = communityStore.quickStart?.lastState?.scrollRatio
    if (typeof scrollRatio === 'number') {
      nextTick(() => {
        setTimeout(() => {
          const container = document.querySelector('.scroll-container')
          if (container) {
            const maxScroll = container.scrollHeight - container.clientHeight
            if (maxScroll > 0) {
              container.scrollTop = maxScroll * scrollRatio
              setTimeout(() => {
                const newMaxScroll = container.scrollHeight - container.clientHeight
                if (newMaxScroll !== maxScroll) {
                  container.scrollTop = newMaxScroll * scrollRatio
                }
              }, 200)
            }
          }
        }, 300)
      })
    }
  }

  onMounted(async () => {
    loadingStates.value.isGridLoading = true
    try {
      communityStore.quickStart.modelListPathParams.current = 1
      await fetchData(0, communityStore.quickStart.modelListPathParams.page_size)
      await nextTick()
      restoreScrollPosition()
    } finally {
      setTimeout(() => {
        loadingStates.value.isGridLoading = false
      }, 300)
    }
  })



  const handleImageLoad = (_e: Event, modelId: number | string) => {
    cacheState.value.imageLoadStates.set(modelId, true)
  }

  const handleImageError = async (e: Event, modelId: number | string) => {
    const img = e.target as HTMLImageElement
    const src = img.src

    if (!retryCountMap.value.has(src)) {
      retryCountMap.value.set(src, 0)
    }

    const retryCount = retryCountMap.value.get(src) || 0
    if (retryCount < MAX_RETRY_COUNT) {
      retryCountMap.value.set(src, retryCount + 1)
      img.src = src
    } else {
      cacheState.value.imageLoadStates.set(modelId, false)
      retryCountMap.value.delete(src)
    }
  }
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-6 pt-6 pb-0 sticky top-0 z-20">
      <ModelFilterBar
        v-model:show-sort-popover="showSortPopover"
        page="quickStart"
        @fetch-data="handleFilterChange"
      />
    </div>

    <BaseModelGrid
      :models="communityStore.quickStart.models"
      :loading="loadingStates.isGridLoading"
      :total="communityStore.quickStart.modelListPathParams.total"
      :page-size="communityStore.quickStart.modelListPathParams.page_size"
      :cache-key="cacheState.key"
      :on-fetch-data="fetchData"
      :on-model-action="handleLoadWorkflow"
      :image-load-states="cacheState.imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
      mode="publicity"
      @scroll="handleScroll"
      @load-more="loadMore"
      @scroll-to-top="scrollToTop"
    />
  </div>
</template>
