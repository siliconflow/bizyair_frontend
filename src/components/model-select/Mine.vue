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
  const currentTab = ref<ModeTabType>('posts')
  const loading = ref(false)
  const hasMore = ref(true)
  const hasPrevious = ref(false)

  const showSortPopover = ref(false)

  const isGridLoading = ref(false)

  const cacheKey = ref(0)

  const lastLoadedPage = ref(1)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true

    try {
      if (
        modelSelectStore.mine[currentTab.value]?.models.length >=
        modelSelectStore.mine[currentTab.value]?.modelListPathParams.total
      ) {
        hasMore.value = false
        return
      }
      const currentState = modelSelectStore.mine[currentTab.value]
      const nextPage = currentState.modelListPathParams.current + 1
      currentState.modelListPathParams.current = nextPage

      const response = await get_model_list(
        {
          ...currentState.modelListPathParams,
          mode: modelSelectStore.TabSource
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
          ...modelSelectStore.mine[currentTab.value].modelListPathParams,
          current: pageNumber + 1,
          page_size: pageSize
        },
        modelSelectStore.mine[currentTab.value].filterState
      )

      if (response?.data?.list) {
        modelSelectStore.mine[currentTab.value].modelListPathParams.total = response.data.total || 0

        if (pageNumber === 0) {
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

  const switchTab = async (tab: ModeTabType) => {
    console.log('aaa',new Date().getTime())
    currentTab.value = tab
    const currentState = modelSelectStore.mine[tab]

    cacheKey.value++

    imageLoadStates.value.clear()

    if (currentState?.lastState) {
      lastLoadedPage.value = currentState.lastState.currentPage
      hasMore.value = currentState.lastState.hasMore ?? true
      hasPrevious.value = currentState.lastState.hasPrevious
console.log('来了1')
      await fetchData(0, modelSelectStore.mine[currentTab.value].modelListPathParams.page_size)
    } else {
      currentState.modelListPathParams.current = 1
      lastLoadedPage.value = 1
      console.log('来了2')
      await fetchData(0, modelSelectStore.mine[currentTab.value].modelListPathParams.page_size)
    }
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
    console.log(new Date().getTime())
    isGridLoading.value = true
    try {
      modelSelectStore.mine[currentTab.value].modelListPathParams.current = 1
      console.log('来了3')
      await fetchData(0, modelSelectStore.mine[currentTab.value].modelListPathParams.page_size)
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
        cacheKey.value++

        imageLoadStates.value.clear()
        modelSelectStore.mine[currentTab.value].modelListPathParams.current = 1
        console.log('来了4')
        await fetchData(0, modelSelectStore.mine[currentTab.value].modelListPathParams.page_size)
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
            @fetch-data="
              () => {
                modelSelectStore.mine.posts.modelListPathParams.current = 1
                console.log('来了5')
                fetchData(0, modelSelectStore.mine.posts.modelListPathParams.page_size)
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
                modelSelectStore.mine.forked.modelListPathParams.current = 1
                console.log('来了6')
                fetchData(0, modelSelectStore.mine.forked.modelListPathParams.page_size)
              }
            "
          />
        </template>
        <template #community>
          <ModelFilterBar
            v-model:show-sort-popover="showSortPopover"
            page="community"
            @fetch-data="
              () => {
                modelSelectStore.mine.community.modelListPathParams.current = 1
                console.log('来了7')
                fetchData(0, modelSelectStore.mine.community.modelListPathParams.page_size)
              }
            "
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
