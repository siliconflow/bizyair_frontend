<script setup lang="ts">
  defineOptions({
    name: 'Mine'
  })

  import { ref, onMounted, watch } from 'vue'
  import ModelFilterBar from '@/components/model-select/modules/ModelFilterBar.vue'
  import MineTabs from '@/components/model-select/modules/MineTabs.vue'
  import { useModelSelectStore } from '@/stores/modelSelectStore'
  import { modelStore } from '@/stores/modelStatus'
  import { get_model_list } from '@/api/model'
  import { useToaster } from '@/components/modules/toats'
  import { Model, ModeTabType } from '@/types/model'
  import NewPostButton from '@/components/community/modules/NewPostButton.vue'
  import BaseModelGrid from '@/components/model-select/modules/BaseModelGrid.vue'
  import ModelDetail from '@/components/model-select/detail/Index.vue'

  const modelSelectStore = useModelSelectStore()
  const useModelStore = modelStore()
  const currentTab = ref<ModeTabType>(modelSelectStore.currentTab)
  const loading = ref(false)
  const hasMore = ref(true)

  const showSortPopover = ref(false)
  const isGridLoading = ref(false)
  const cacheKey = ref(0)
  const imageLoadStates = ref<Map<number | string, boolean>>(new Map())
  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true

    try {
      const { current, page_size } = modelSelectStore.mine[currentTab.value].modelListPathParams
      const currentTotal = modelSelectStore.mine[currentTab.value].modelListPathParams.total
      if (current * page_size >= currentTotal) {
        hasMore.value = false
        return
      }

      modelSelectStore.mine[currentTab.value].modelListPathParams.current = current + 1
      modelSelectStore.mine[currentTab.value].modelListPathParams.mode = modelSelectStore.TabSource
      await fetchData()
    } catch (error) {
      console.error('fetch data error:', error)
      useToaster.error(`Failed to load more data: ${error}`)
    } finally {
      loading.value = false
    }
  }

  const fetchData = async () => {
    try {
      const response = await get_model_list(
        {
          ...modelSelectStore.mine[currentTab.value].modelListPathParams
        },
        modelSelectStore.mine[currentTab.value].filterState
      )

      if (response?.data?.list) {
        modelSelectStore.mine[currentTab.value].modelListPathParams.total = response.data.total || 0

        hasMore.value =
          modelSelectStore.mine[currentTab.value].modelListPathParams.current *
            modelSelectStore.mine[currentTab.value].modelListPathParams.page_size <
          modelSelectStore.mine[currentTab.value].modelListPathParams.total
        if (modelSelectStore.mine[currentTab.value].modelListPathParams.current === 1) {
          modelSelectStore.mine[currentTab.value].models = response.data.list
        } else {
          modelSelectStore.mine[currentTab.value].models = [
            ...modelSelectStore.mine[currentTab.value].models,
            ...response.data.list
          ]
        }

        return response.data.list
      } else {
        modelSelectStore.mine[currentTab.value].models = []
      }
    } catch (error) {
      console.error('Fetch data error:', error)
      useToaster.error(`Failed to fetch data: ${error}`)
      modelSelectStore.mine[currentTab.value].models = []
    }
  }

  const doMetaFetch = async () => {
    modelSelectStore.mine[currentTab.value].modelListPathParams.current = 1
    await fetchData()
  }

  const switchTab = async (tab: ModeTabType) => {
    currentTab.value = tab
    modelSelectStore.currentTab = tab
    cacheKey.value++
    imageLoadStates.value.clear()
    hasMore.value = true
    loading.value = false

    isGridLoading.value = true
    await doMetaFetch()

    const { current, page_size, total } =
      modelSelectStore.mine[currentTab.value].modelListPathParams
    hasMore.value = current * page_size < total

    isGridLoading.value = false
  }

  const handleImageLoad = (_event: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, true)
  }

  const handleImageError = (_event: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, false)
  }

  const handleNewModel = () => {
    useModelStore.setDialogStatus(true)
    modelSelectStore.showDialog = false
  }

  const handleNewWorkflow = () => {
    useModelStore.setDialogStatusWorkflow(true)
    modelSelectStore.showDialog = false
  }

  const handleModelAction = async (model: Model) => {
    if (!model?.versions || model?.versions?.length === 0) {
      useToaster.error('No model versions found')
      return
    }
    modelSelectStore.setApplyObject(model?.versions?.[0], model)
    modelSelectStore.showDialog = false
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
    () => modelSelectStore.reload,
    async (newVal: number, oldVal: number) => {
      if (newVal !== oldVal) {
        isGridLoading.value = true
        cacheKey.value++
        imageLoadStates.value.clear()
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
        <template #community>
          <ModelFilterBar
            v-model:show-sort-popover="showSortPopover"
            page="community"
            @fetch-data="doMetaFetch"
          />
        </template>
      </MineTabs>
    </div>
    <BaseModelGrid
      :models="modelSelectStore.mine[currentTab]?.models || []"
      :loading="isGridLoading"
      :total="modelSelectStore.mine[currentTab]?.modelListPathParams.total || 0"
      :page-size="modelSelectStore.mine[currentTab]?.modelListPathParams.page_size"
      :cache-key="cacheKey"
      :on-fetch-data="fetchData"
      :on-model-action="handleModelAction"
      :image-load-states="imageLoadStates"
      :on-image-load="handleImageLoad"
      :on-image-error="handleImageError"
      :class="currentTab"
      @load-more="loadMore"
    />
    <ModelDetail v-if="modelSelectStore.showCommunityDetail" />
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
