<script setup lang="ts">
  defineOptions({
    name: 'Mine'
  })

  import { ref, onMounted, watch, inject } from 'vue'
  import ModelFilterBar from '@/components/community/modules/ModelFilterBar.vue'
  import MineTabs from '@/components/community/modules/MineTabs.vue'
  import { useCommunityStore } from '@/stores/communityStore'
  import { modelStore } from '@/stores/modelStatus'
  import { get_model_list, get_workflow_dowload_url } from '@/api/model'
  import { useToaster } from '@/components/modules/toats'
  import { Model } from '@/types/model'
  import NewPostButton from '@/components/community/modules/NewPostButton.vue'
  import BaseModelGrid from '@/components/community/modules/BaseModelGrid.vue'

  type TabType = 'posts' | 'forked'

  const communityStore = useCommunityStore()
  const useModelStore = modelStore()
  const currentTab = ref<TabType>('posts')

  const loading = ref(false)
  const hasMore = ref(true)

  const showSortPopover = ref(false)
  const isGridLoading = ref(false)
  const cacheKey = ref(0)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true

    try {
      if (
        communityStore.mine[currentTab.value]?.models.length >=
        communityStore.mine[currentTab.value]?.modelListPathParams.total
      ) {
        hasMore.value = false
        return
      }
      const currentState = communityStore.mine[currentTab.value]
      const nextPage = currentState.modelListPathParams.current + 1
      currentState.modelListPathParams.current = nextPage

      const mode = currentTab.value === 'posts' ? 'my' : 'my_fork'
      const response = await get_model_list(
        {
          ...currentState.modelListPathParams,
          mode
        },
        currentState.filterState
      )

      if (response?.data?.list) {
        currentState.models = [...currentState.models, ...response.data.list]
        currentState.modelListPathParams.total = response.data.total
        hasMore.value = currentState.models.length < response.data.total
      } else {
        hasMore.value = false
      }
      return []
    } catch (error) {
      console.error('fetch data error:', error)
      useToaster.error(`Failed to load more data: ${error}`)
    } finally {
      loading.value = false
    }
  }

  const fetchData = async (pageNumber: number, pageSize: number) => {
    try {
      const response = await get_model_list(
        {
          ...communityStore.mine[currentTab.value].modelListPathParams,
          current: pageNumber + 1,
          page_size: pageSize
        },
        communityStore.mine[currentTab.value].filterState
      )

      if (response?.data?.list) {
        communityStore.mine[currentTab.value].modelListPathParams.total = response.data.total || 0

        if (pageNumber === 0) {
          communityStore.mine[currentTab.value].models = response.data.list
        } else {
          communityStore.mine[currentTab.value].models = [
            ...communityStore.mine[currentTab.value].models,
            ...response.data.list
          ]
        }

        return response.data.list
      } else {
        communityStore.mine[currentTab.value].models = []
      }
    } catch (error) {
      console.error('Fetch data error:', error)
      useToaster.error(`Failed to fetch data: ${error}`)
      communityStore.mine[currentTab.value].models = []
    }
  }


  const switchTab = async (tab: TabType) => {
    currentTab.value = tab
    const currentState = communityStore.mine[tab]
    cacheKey.value++
    imageLoadStates.value.clear()
    currentState.modelListPathParams.current = 1
    await fetchData(0, communityStore.mine[currentTab.value].modelListPathParams.page_size)
  }

  const imageLoadStates = ref<Map<number | string, boolean>>(new Map())

  const handleImageLoad = (_event: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, true)
  }

  const handleImageError = (_event: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, false)
  }

  const handleNewModel = () => {
    useModelStore.setDialogStatus(true)
    communityStore.showDialog = false
  }

  const handleNewWorkflow = () => {
    useModelStore.setDialogStatusWorkflow(true)
    communityStore.showDialog = false
  }

  const comfyUIApp: any = inject('comfyUIApp')
  if (!comfyUIApp) {
    console.error('comfyUIApp is not properly injected')
  }

  const handleModelAction = async (model: Model) => {
    if (model.type === 'Workflow') {
      await handleLoadWorkflow(model.versions)
    } else {
      await handleAddNode(model)
    }
  }

  const handleLoadWorkflow = async (versions: any) => {
    if (!versions || versions.length === 0) {
      useToaster.error('No workflow found')
      return
    }
    const workflow = await get_workflow_dowload_url(versions[0].id, versions[0].sign)

    if (workflow.data && comfyUIApp && comfyUIApp.graph) {
      comfyUIApp.graph.clear()
      await comfyUIApp.loadGraphData(workflow.data)
    }
    communityStore.showDialog = false
  }
  const handleAddNode = async (model: Model) => {
    try {
      let nodeID = model.type === 'LoRA' ? 'BizyAir_LoraLoader' : 'BizyAir_ControlNetLoader'
      let loraLoaderNode = window.LiteGraph?.createNode(nodeID)
      const canvas = window.LGraphCanvas?.active_canvas

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
    } catch (error) {
      console.error('Failed to add node:', error)
      useToaster.error(`Failed to add node: ${error}`)
    }
  }

  onMounted(async () => {
    isGridLoading.value = true
    try {
      communityStore.mine[currentTab.value].modelListPathParams.current = 1
      await fetchData(0, communityStore.mine[currentTab.value].modelListPathParams.page_size)
    } finally {
      setTimeout(() => {
        isGridLoading.value = false
      }, 200)
    }
  })


  watch(
    () => useModelStore.reload,
    async (newVal: number, oldVal: number) => {
      console.log('newVal', newVal)
      if (newVal !== oldVal) {
        cacheKey.value++
        imageLoadStates.value.clear()
        communityStore.mine[currentTab.value].modelListPathParams.current = 1
        await fetchData(0, communityStore.mine[currentTab.value].modelListPathParams.page_size)
      }
    },
    { deep: true }
  )
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="px-6  pb-0 sticky top-0 z-20">
      <MineTabs v-model="currentTab" @update:model-value="switchTab">
        <template #posts>
          <ModelFilterBar
            v-model:show-sort-popover="showSortPopover"
            page="posts"
            @fetch-data="
              () => {
                communityStore.mine.posts.modelListPathParams.current = 1
                fetchData(0, communityStore.mine.posts.modelListPathParams.page_size)
              }
            "
          />
          <NewPostButton @new-model="handleNewModel" @new-workflow="handleNewWorkflow" />
        </template>

        <template #forked>
          <ModelFilterBar
            v-model:show-sort-popover="showSortPopover"
            page="forked"
            @fetch-data="
              () => {
                communityStore.mine.forked.modelListPathParams.current = 1
                fetchData(0, communityStore.mine.forked.modelListPathParams.page_size)
              }
            "
          />
        </template>
      </MineTabs>
    </div>

    <BaseModelGrid
      :models="communityStore.mine[currentTab]?.models || []"
      :loading="isGridLoading"
      :total="communityStore.mine[currentTab]?.modelListPathParams.total || 0"
      :page-size="communityStore.mine[currentTab]?.modelListPathParams.page_size"
      :cache-key="cacheKey"
      :on-fetch-data="fetchData"
      :on-model-action="handleModelAction"
      :image-load-states="imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
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
</style>
