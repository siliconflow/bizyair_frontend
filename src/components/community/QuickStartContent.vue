<script setup lang="ts">
  import { ref, onMounted, inject } from 'vue'
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
  const loading = ref(false)
  const isGridLoading = ref(false)
  const cacheKey = ref(0)
  const imageLoadStates = ref<Map<number | string, boolean>>(new Map())

  const hasMore = ref(true)
  const showSortPopover = ref(false)

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

  const doMetaFetch = async () => {
    communityStore.quickStart.modelListPathParams.current = 1
    await fetchData()
  }

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true

    try {
      const { current, page_size, total } = communityStore.quickStart.modelListPathParams
      if (current * page_size >= total) {
        hasMore.value = false
        return
      }

      communityStore.quickStart.modelListPathParams.current = current + 1
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
          ...communityStore.quickStart.modelListPathParams
        },
        communityStore.quickStart.filterState
      )

      if (response?.data?.list) {
        communityStore.quickStart.modelListPathParams.total = response.data.total || 0

        if (communityStore.quickStart.modelListPathParams.current === 1) {
          communityStore.quickStart.models = response.data.list
        } else {
          communityStore.quickStart.models = [
            ...communityStore.quickStart.models,
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

  const handleImageLoad = (_e: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, true)
  }

  const handleImageError = async (_e: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, false)
  }
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-6 pt-6 pb-0 sticky top-0 z-20">
      <ModelFilterBar
        v-model:show-sort-popover="showSortPopover"
        page="quickStart"
        @fetch-data="doMetaFetch"
      />
    </div>

    <BaseModelGrid
      :models="communityStore.quickStart.models"
      :loading="isGridLoading"
      :total="communityStore.quickStart.modelListPathParams.total"
      :page-size="communityStore.quickStart.modelListPathParams.page_size"
      :cache-key="cacheKey"
      :on-fetch-data="fetchData"
      :on-model-action="handleLoadWorkflow"
      :image-load-states="imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
      @load-more="loadMore"
    />
  </div>
</template>
