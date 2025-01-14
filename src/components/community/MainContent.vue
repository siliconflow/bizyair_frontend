<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
  import BaseModelGrid from './modules/BaseModelGrid.vue'
  import ModelFilterBar from './modules/ModelFilterBar.vue'
  import { useCommunityStore } from '@/stores/communityStore'
  import { get_model_list } from '@/api/model'
  import { useToaster } from '@/components/modules/toats'
  import { Model } from '@/types/model'

  defineOptions({
    name: 'MainContent'
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

  const handleAddNode = async (model: Model) => {
    try {
      let nodeID = model.type === 'LoRA' ? 'BizyAir_LoraLoader' : 'BizyAir_ControlNetLoader'
      let loraLoaderNode = window.LiteGraph?.createNode(nodeID)
      const canvas = window.LGraphCanvas?.active_canvas

      if (loraLoaderNode && canvas) {
        loraLoaderNode.title =
          model.type === 'LoRA' ? '☁️BizyAir Load Lora' : '☁️BizyAir Load ControlNet Model'
        loraLoaderNode.color = '#7C3AED'

        const widgetValues =
          model.type === 'LoRA'
            ? [model.name, 1.0, 1.0, model.versions?.[0]?.id || '']
            : [model.name, model.versions?.[0]?.id || '']

        loraLoaderNode.widgets_values = widgetValues
        if (loraLoaderNode.widgets) {
          loraLoaderNode.widgets.forEach((widget: any, index: number) => {
            if (widget && widgetValues[index] !== undefined) {
              widget.value = widgetValues[index]
            }
          })
        }
        const currentConfig = canvas.graph.serialize()
        const nodeCount = currentConfig.nodes?.length || 0

        const visibleRect = canvas.visible_area
        const offsetX = (nodeCount % 3) * 30
        const offsetY = Math.floor(nodeCount / 3) * 25
        const baseX = visibleRect ? visibleRect[0] + 100 : 100
        const baseY = visibleRect ? visibleRect[1] + 100 : 100

        loraLoaderNode.pos = [baseX + offsetX, baseY + offsetY]

        canvas.graph.add(loraLoaderNode)
        communityStore.showDialog = false
        useToaster.success('Node added successfully')
      }
    } catch (error) {
      console.error('Failed to add node:', error)
      useToaster.error(`Failed to add node: ${error}`)
    }
  }

  const handleFilterChange = async () => {
    loadingStates.value.isGridLoading = true
    cacheState.value.key += 1

    try {
      communityStore.mainContent.modelListPathParams.current = 1
      communityStore.mainContent.models = []
      hasMore.value = true

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      await fetchData(0, communityStore.mainContent.modelListPathParams.page_size)
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
      communityStore.mainContent.lastState = {
        currentPage: communityStore.mainContent.modelListPathParams.current,
        hasMore: hasMore.value,
        hasPrevious: true,
        loadedPages: Array.from(cacheState.value.loadedPages),
        scrollRatio: container.scrollTop / maxScroll,
        totalItems: communityStore.mainContent.modelListPathParams.total
      }
    }
  }

  const loadMore = async () => {
    if (loadingStates.value.isLoadingMore || !hasMore.value) return
    loadingStates.value.isLoadingMore = true

    try {
      const currentPage = communityStore.mainContent.modelListPathParams.current
      const pageSize = communityStore.mainContent.modelListPathParams.page_size
      const total = communityStore.mainContent.modelListPathParams.total

      if (currentPage * pageSize >= total) {
        hasMore.value = false
        return
      }

      communityStore.mainContent.modelListPathParams.current = currentPage + 1
      await fetchData(currentPage, pageSize)

      hasMore.value = (currentPage + 1) * pageSize < total
    } catch (error) {
      console.error('Load more error:', error)
      useToaster.error(`Failed to load more: ${error}`)
    } finally {
      loadingStates.value.isLoadingMore = false
    }
  }



  const fetchData = async (pageNumber: number, pageSize: number): Promise<unknown[]> => {
    try {
      const response = await get_model_list(
        {
          ...communityStore.mainContent.modelListPathParams,
          current: pageNumber + 1,
          page_size: pageSize
        },
        communityStore.mainContent.filterState
      )

      if (response?.data?.list) {
        communityStore.mainContent.modelListPathParams.total = response.data.total || 0

        if (pageNumber === 0) {
          communityStore.mainContent.models = response.data.list
        } else {
          communityStore.mainContent.models = [
            ...communityStore.mainContent.models,
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

  watch(
    () => communityStore.reload,
    async (newVal: number, oldVal: number) => {
      if (newVal !== oldVal) {
        loadingStates.value.isGridLoading = true
        try {
          await fetchData(0, communityStore.mainContent.modelListPathParams.page_size)
        } finally {
          setTimeout(() => {
            loadingStates.value.isGridLoading = false
          }, 300)
        }
      }
    }
  )


  onUnmounted(() => {
    if (loadingStates.value.isGridLoading) {
      loadingStates.value.isGridLoading = false
    }
  })

  

  onMounted(async () => {
    loadingStates.value.isGridLoading = true
    try {
      communityStore.mainContent.modelListPathParams.current = 1
      await fetchData(0, communityStore.mainContent.modelListPathParams.page_size)
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
        page="mainContent"
        @fetch-data="handleFilterChange"
      />
    </div>

    <BaseModelGrid
      :models="communityStore.mainContent.models"
      :loading="loadingStates.isGridLoading"
      :total="communityStore.mainContent.models.length || 100"
      :page-size="communityStore.mainContent.modelListPathParams.page_size"
      :cache-key="cacheState.key"
      :on-fetch-data="fetchData"
      :on-model-action="handleAddNode"
      :image-load-states="cacheState.imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
      mode="publicity"
      @scroll="handleScroll"
      @load-more="loadMore"
    />
  </div>
</template>


