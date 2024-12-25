<script setup lang="ts">
  defineOptions({
    name: 'WorkflowsContent'
  })

  import { ref, onMounted, onUnmounted } from 'vue'
  import ModelFilterBar from './moudles/ModelFilterBar.vue'

  interface Model {
    id: number
    title: string
    baseModel: string
    imageUrl: string
    stats: {
      downloads: string
      likes: string
      rating: string
      views: string
    }
  }

  // 生成测试数据的函数
  const generateMockData = (startId: number, count: number): Model[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: startId + index,
      title: `模型 ${startId + index}`,
      baseModel: ['LORA', 'Checkpoint', 'TextualInversion', 'Hypernetwork'][
        Math.floor(Math.random() * 4)
      ],
      imageUrl:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f28c9156-68b3-400f-8f90-88efcf279b80/width=450/TB4WSC6XPEJRKFSVHSN7ZG6YM0.jpeg',
      stats: {
        downloads: `${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 9)}k`,
        likes: `${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 9)}k`,
        rating: `${Math.floor(Math.random() * 15 + 85)}`, // 85-99
        views: `${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 9)}k`
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
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800))

      // 这里之后替换为实际的API调用
      const newData = generateMockData(models.value.length + 1, 12)
      models.value.push(...newData)

      // 模拟数据上限
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
    observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      {
        threshold: 0.1, // 当目标元素10%可见时触发
        rootMargin: '100px' // 提前100px触发
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
</script>

<template>
  <div class="p-6 min-h-screen">
    <ModelFilterBar
      :show-sort-popover="showSortPopover"
      @update:show-sort-popover="showSortPopover = $event"
      page="workflows"
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
            {{ model.baseModel }}
          </div>

          <div class="relative aspect-[2/3] md:aspect-[3/4] lg:aspect-[2/3] overflow-hidden">
            <img
              :src="model.imageUrl"
              :alt="model.title"
              class="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>

          <div
            class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-black/30"
          >
            <h3 class="text-base text-white font-medium mb-2">{{ model.title }}</h3>
            <div class="flex items-center space-x-3 text-white/90 text-xs">
              <span class="flex items-center">
                <span class="opacity-80">↓ {{ model.stats.downloads }}</span>
              </span>
              <span class="flex items-center">
                <span class="opacity-80">⚡ {{ model.stats.likes }}</span>
              </span>
              <span class="flex items-center">
                <span class="opacity-80">★ {{ model.stats.rating }}</span>
              </span>
              <span class="flex items-center">
                <span class="opacity-80">♥ {{ model.stats.views }}</span>
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
