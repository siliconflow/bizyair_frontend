<script setup lang="ts">
  defineOptions({
    name: 'MainContent'
  })

  import { ref, onMounted, onUnmounted } from 'vue'
  import ModelFilterBar from './moudles/ModelFilterBar.vue'
  import { useCommunityStore } from '@/stores/communityStore'
  import type { Model } from '@/types/model'

  const communityStore = useCommunityStore()

  // 生成测试数据的函数
  const generateMockData = (startId: number, count: number): Model[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: String(startId + index),
      name: `模型 ${startId + index}`,
      type: ['LORA', 'Checkpoint', 'TextualInversion', 'Hypernetwork'][
        Math.floor(Math.random() * 4)
      ],
      user_id: String(Math.floor(Math.random() * 1000)),
      user_name: `User ${Math.floor(Math.random() * 100)}`,
      counter: {
        downloads: Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 100),
        rating: Math.floor(Math.random() * 15 + 85),
        views: Math.floor(Math.random() * 50)
      }
    }))
  }

  const models = ref<Model[]>(generateMockData(1, 12))
  const loading = ref(false)
  const hasMore = ref(true)
  const loadingRef = ref<HTMLDivElement | null>(null)

  // 加载更多数据
  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true

    try {
      // 获取当前页面的筛选状态
      const currentState = communityStore.mainContent
      const params = {
        keyword: currentState.filterState.keyword,
        model_types: currentState.filterState.model_types,
        base_models: currentState.filterState.base_models,
        sort: currentState.filterState.sort,
        page: Math.ceil(models.value.length / 12) + 1,
        pageSize: 12
      }

      // 这里替换为实际的API调用
      // const response = await fetchModels(params)
      // models.value.push(...response.data)
      // hasMore.value = response.hasMore

      // 临时使用模拟数据
      const newData = generateMockData(models.value.length + 1, 12)
      models.value.push(...newData)

      if (models.value.length >= 100) {
        hasMore.value = false
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 设置 Intersection Observer
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    // 初始化数据
    fetchData()

    observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    if (loadingRef.value) {
      observer.observe(loadingRef.value)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  const showSortPopover = ref(false)

  const fetchData = async () => {
    loading.value = true
    models.value = [] // 清空现有数据

    try {
      const currentState = communityStore.mainContent
      const params = {
        keyword: currentState.filterState.keyword,
        model_types: currentState.filterState.model_types,
        base_models: currentState.filterState.base_models,
        sort: currentState.filterState.sort,
        page: 1,
        pageSize: 12
      }

      // 这里替换为实际的API调用
      // const response = await fetchModels(params)
      // models.value = response.data
      // hasMore.value = response.hasMore

      // 临时使用模拟数据
      models.value = generateMockData(1, 12)
      hasMore.value = true
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="h-full">
    <ModelFilterBar
      v-model:show-sort-popover="showSortPopover"
      page="mainContent"
      @update:show-sort-popover="showSortPopover = $event"
    />
    <div class="playground-container">
      <div
        v-for="model in models"
        :key="model.id"
        class="group flex flex-col min-w-0 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-102"
      >
        <div
          class="relative flex flex-col flex-1 rounded-lg cursor-pointer overflow-hidden bg-[#1a1a1a]"
        >
          <div
            class="absolute left-3 top-3 min-w-[100px] h-[34px] flex items-center justify-center z-10 text-white font-inter text-base font-bold bg-[#25252566] backdrop-blur-sm px-4 rounded-[6px] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
          >
            {{ model.type }}
          </div>

          <div class="relative aspect-[2/3] md:aspect-[3/4] lg:aspect-[2/3] overflow-hidden">
            <img
              :src="model.versions?.[0]?.path"
              :alt="model.name"
              class="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>

          <div
            class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-black/30"
          >
            <h3 class="text-base text-white font-medium mb-2">{{ model.name }}</h3>
            <div class="flex items-center space-x-3 text-white/90 text-xs">
              <span class="flex items-center">
                <span class="opacity-80">↓ {{ model.counter?.downloads }}</span>
              </span>
              <span class="flex items-center">
                <span class="opacity-80">⚡ {{ model.counter?.likes }}</span>
              </span>
              <span class="flex items-center">
                <span class="opacity-80">★ {{ model.counter?.rating }}</span>
              </span>
              <span class="flex items-center">
                <span class="opacity-80">♥ {{ model.counter?.views }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多指示器 -->
    <div ref="loadingRef" class="py-4 text-center">
      <div v-if="loading" class="text-white/60">加载中...</div>
      <div v-else-if="!hasMore" class="text-white/60">没有更多数据了</div>
      <div v-else class="h-4"></div>
    </div>
  </div>
</template>

<style scoped>
  .playground-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    justify-content: space-between;
    align-items: stretch;
  }

  @media screen and (max-width: 767px) {
    .playground-container {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  @media screen and (min-width: 768px) and (max-width: 1023px) {
    .playground-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (min-width: 1024px) and (max-width: 1359px) {
    .playground-container {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media screen and (min-width: 1360px) and (max-width: 1919px) {
    .playground-container {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media screen and (min-width: 1920px) and (max-width: 2559px) {
    .playground-container {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  @media screen and (min-width: 2560px) {
    .playground-container {
      grid-template-columns: repeat(6, 1fr);
    }
  }
</style>
