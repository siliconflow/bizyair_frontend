<script setup lang="ts">
  import { ref, watch, inject, onMounted } from 'vue'
  import ModelFilterBar from '@/components/community/modules/ModelFilterBar.vue'
  import MineTabs from '@/components/community/modules/MineTabs.vue'
  import { useCommunityStore } from '@/stores/communityStore'
  import { modelStore } from '@/stores/modelStatus'
  import { get_workflow_dowload_url } from '@/api/model'
  import { useToaster } from '@/components/modules/toats'
  import { Model } from '@/types/model'
  import NewPostButton from '@/components/community/modules/NewPostButton.vue'
  import BaseModelGrid from '@/components/community/modules/BaseModelGrid.vue'
  import { useModelGrid } from '@/composables/useModelGrid'

  defineOptions({
    name: 'Mine'
  })

  type TabType = 'posts' | 'forked'

  const communityStore = useCommunityStore()
  const useModelStore = modelStore()
  const currentTab = ref<TabType>('posts')
  communityStore.mineTabSource = currentTab.value
  const comfyUIApp: any = inject('comfyUIApp')

  const {
    state: { isGridLoading, cacheKey, showSortPopover, imageLoadStates },
    storeState,
    doMetaFetch,
    loadMore,
    handleImageLoad,
    handleImageError
  } = useModelGrid({
    pageKey: currentTab
  })

  const handleNewModel = () => {
    useModelStore.setDialogStatus(true)
  }

  const handleNewWorkflow = () => {
    useModelStore.setDialogStatusWorkflow(true)
  }

  const handleLoadWorkflow = async (versions: any) => {
    if (!versions || versions.length === 0) {
      useToaster.error('No workflow found')
      return
    }
    const workflow = await get_workflow_dowload_url(versions[0].id, versions[0].sign)

    if (workflow.data && comfyUIApp && comfyUIApp.graph) {
      comfyUIApp.graph.clear()
      if(workflow.data.templates && workflow.data.templates.length > 0){
          await comfyUIApp.loadTemplateData(workflow.data)
      }
      else{
          await comfyUIApp.loadGraphData(workflow.data)
      }
    }
    else{
        useToaster.error('Failed to load workflow')
    }
    communityStore.showDialog = false
  }

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

  const handleModelAction = async (model: Model) => {
    if (model.type === 'Workflow') {
      await handleLoadWorkflow(model.versions)
    } else {
      await handleAddNode(model)
    }
  }

  const switchTab = async (tab: TabType) => {
    currentTab.value = tab
    communityStore.mineTabSource = tab
    if (storeState.value.models.length === 0) {
      isGridLoading.value = true
      setTimeout(() => {
        isGridLoading.value = false
      }, 300)
    }
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

  watch(
    () => useModelStore.reload,
    async (newVal: number, oldVal: number) => {
      if (newVal !== oldVal) {
        isGridLoading.value = true
        cacheKey.value++
        imageLoadStates.value = new Map()
        await doMetaFetch()
        isGridLoading.value = false
      }
    },
    { deep: true }
  )
  watch(
    () => communityStore.reload,
    async (newVal: number, oldVal: number) => {
      if (newVal !== oldVal) {
        isGridLoading.value = true
        cacheKey.value++
        imageLoadStates.value = new Map()
        await doMetaFetch()
        isGridLoading.value = false
      }
    },
    { deep: true }
  )
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="px-6 pb-0 sticky top-0 z-20">
      <MineTabs v-model="currentTab" @update:model-value="switchTab">
        <template #posts>
          <ModelFilterBar
            v-model:show-sort-popover="showSortPopover"
            page="posts"
            @fetch-data="doMetaFetch"
          />
          <NewPostButton @new-model="handleNewModel" @new-workflow="handleNewWorkflow" />
        </template>

        <template #forked>
          <ModelFilterBar
            v-model:show-sort-popover="showSortPopover"
            page="forked"
            @fetch-data="doMetaFetch"
          />
        </template>
      </MineTabs>
    </div>

    <BaseModelGrid
      :models="storeState.models"
      :loading="isGridLoading"
      :total="storeState.models.length || 0"
      :page-size="storeState.modelListPathParams.page_size"
      :cache-key="cacheKey"
      :on-fetch-data="doMetaFetch"
      :on-model-action="handleModelAction"
      :image-load-states="imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
      class="mine-grid"
      @load-more="loadMore"
    />
  </div>
</template>

<style scoped>
  .scroll-container {
    height: calc(80vh - 220px);
    margin-top: 1rem;
    position: relative;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
    -webkit-overflow-scrolling: touch;
  }

  :deep(.mine-grid .n-scrollbar > .n-scrollbar-rail.n-scrollbar-rail--vertical--right),
  :deep(.mine-grid .n-scrollbar + .n-scrollbar-rail.n-scrollbar-rail--vertical--right) {
    right: 20px !important;
    top: 220px !important;
    bottom: 80px !important;
  }

  :deep(.mine-grid .v-vl:not(.v-vl--show-scrollbar)) {
    padding-bottom: 100px;
  }
</style>
