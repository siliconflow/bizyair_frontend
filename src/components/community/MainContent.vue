<script setup lang="ts">
  import { onMounted, watch } from 'vue'
  import BaseModelGrid from './modules/BaseModelGrid.vue'
  import ModelFilterBar from './modules/ModelFilterBar.vue'
  import { useCommunityStore } from '@/stores/communityStore'
  import { useToaster } from '@/components/modules/toats'
  import { Model } from '@/types/model'
  import { useModelGrid } from '@/composables/useModelGrid'

  defineOptions({
    name: 'MainContent'
  })

  const communityStore = useCommunityStore()

  const {
    state: { isGridLoading, cacheKey, showSortPopover, imageLoadStates },
    storeState,
    doMetaFetch,
    loadMore,
    handleImageLoad,
    handleImageError
  } = useModelGrid({
    pageKey: 'mainContent'
  })

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

  watch(
    () => communityStore.reload,
    async (newVal: number, oldVal: number) => {
      if (newVal !== oldVal) {
        cacheKey.value++
        imageLoadStates.value = new Map()
        await doMetaFetch()
      }
    }
  )

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
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-6  pb-0 sticky top-0 z-20">
      <ModelFilterBar
        v-model:show-sort-popover="showSortPopover"
        page="mainContent"
        @fetch-data="doMetaFetch"
      />
    </div>

    <BaseModelGrid
      :models="storeState.models"
      :loading="isGridLoading"
      :total="storeState.models.length || 0"
      :page-size="storeState.modelListPathParams.page_size"
      :cache-key="cacheKey"
      :on-model-action="handleAddNode"
      :image-load-states="imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
      @load-more="loadMore"
    />
  </div>
</template>
