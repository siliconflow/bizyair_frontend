<script setup lang="ts">
  import { onMounted, inject } from 'vue'
  import BaseModelGrid from './modules/BaseModelGrid.vue'
  import ModelFilterBar from './modules/ModelFilterBar.vue'
  import { useCommunityStore } from '@/stores/communityStore'
  import { get_workflow_dowload_url } from '@/api/model'
  import { useToaster } from '@/components/modules/toats'
  import { Model } from '@/types/model'
  import { useModelGrid } from '@/composables/useModelGrid'

  defineOptions({
    name: 'QuickStartContent'
  })

  const communityStore = useCommunityStore()
  const comfyUIApp: any = inject('comfyUIApp')

  const {
    state: { isGridLoading, cacheKey, showSortPopover, imageLoadStates },
    storeState,
    doMetaFetch,
    loadMore,
    handleImageLoad,
    handleImageError
  } = useModelGrid({
    pageKey: 'quickStart'
  })

  const handleLoadWorkflow = async (model: Model) => {
    try {
      if (!model.versions?.[0]) {
        useToaster.error('No workflow found')
        return
      }

      const workflow = await get_workflow_dowload_url(model.versions[0].id, model.versions[0].sign)

      if (workflow.data && comfyUIApp && comfyUIApp.graph) {
        comfyUIApp.graph.clear()
        if(workflow.data.templates && workflow.data.templates.length > 0){
          await comfyUIApp.loadTemplateData(workflow.data)
        }
        else{
          await comfyUIApp.loadGraphData(workflow.data)
        }
        useToaster.success('Workflow loaded successfully')
      }
      else{
        useToaster.error('Failed to load workflow')
      }
      communityStore.showDialog = false
    } catch (error) {
      console.error('Failed to load workflow:', error)
      useToaster.error(`Failed to load workflow: ${error}`)
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
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-6 pb-0 sticky top-0 z-20">
      <ModelFilterBar
        v-model:show-sort-popover="showSortPopover"
        page="quickStart"
        @fetch-data="doMetaFetch"
      />
    </div>

    <BaseModelGrid
      :models="storeState.models"
      :loading="isGridLoading"
      :total="storeState.models.length || 0"
      :page-size="storeState.modelListPathParams.page_size"
      :cache-key="cacheKey"
      :on-fetch-data="doMetaFetch"
      :on-model-action="handleLoadWorkflow"
      :image-load-states="imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
      @load-more="loadMore"
    />
  </div>
</template>
