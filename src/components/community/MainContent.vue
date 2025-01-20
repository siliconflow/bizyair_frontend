<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
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

  const loading = ref(false)
  const isGridLoading = ref(false)
  const cacheKey = ref(0)
  const imageLoadStates = ref<Map<number | string, boolean>>(new Map())

  const hasMore = ref(true)
  const showSortPopover = ref(false)

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

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const { current, page_size, total } = communityStore.mainContent.modelListPathParams
      if (current * page_size >= total) {
        hasMore.value = false
        return
      }
      communityStore.mainContent.modelListPathParams.current = current + 1
      await fetchData()
      hasMore.value = (current + 1) * page_size < total
    } catch (error) {
      console.error('Load more error:', error)
      useToaster.error(`Failed to load more: ${error}`)
    } finally {
      loading.value = false
    }
  }

  const fetchData = async (): Promise<unknown[]> => {
    try {
      const response = await get_model_list(
        {
          ...communityStore.mainContent.modelListPathParams
        },
        communityStore.mainContent.filterState
      )

      if (response?.data?.list) {
        hasMore.value = communityStore.mainContent.models.length < response.data.total
        communityStore.mainContent.modelListPathParams.total = response.data.total || 0

        if (communityStore.mainContent.modelListPathParams.current === 1) {
          communityStore.mainContent.models = response.data.list
        } else {
          communityStore.mainContent.models = [
            ...communityStore.mainContent.models,
            ...response.data.list
          ]
        }
        return response.data.list
      }
      hasMore.value = false
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
        isGridLoading.value = true
        cacheKey.value++
        imageLoadStates.value.clear()
        doMetaFetch()
      }
    }
  )

  const doMetaFetch = async () => {
    communityStore.mainContent.modelListPathParams.current = 1
    await fetchData()
  }

  onMounted(async () => {
    isGridLoading.value = true
    try {
      await doMetaFetch()
    } finally {
      setTimeout(() => {
        isGridLoading.value = false
      }, 200)
    }
  })

  const handleImageLoad = (_event: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, true)
  }

  const handleImageError = (_event: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, false)
  }
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-6 pt-6 pb-0 sticky top-0 z-20">
      <ModelFilterBar
        v-model:show-sort-popover="showSortPopover"
        page="mainContent"
        @fetch-data="doMetaFetch"
      />
    </div>

    <BaseModelGrid
      :models="communityStore.mainContent.models"
      :loading="isGridLoading"
      :total="communityStore.mainContent.models.length || 0"
      :page-size="communityStore.mainContent.modelListPathParams.page_size"
      :cache-key="cacheKey"
      :on-model-action="handleAddNode"
      :image-load-states="imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
      @load-more="loadMore"
    />
  </div>
</template>
