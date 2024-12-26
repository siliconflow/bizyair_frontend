<script setup lang="ts">
  defineOptions({
    name: 'Mine'
  })

  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import ModelFilterBar from '@/components/community/moudles/ModelFilterBar.vue'
  import MineTabs from '@/components/community/moudles/MineTabs.vue'
  import { useCommunityStore } from '@/stores/communityStore'
  import type { Model, MineState } from '@/types/model'

  type TabType = 'posts' | 'forked'

  const communityStore = useCommunityStore()
  const currentTab = ref<TabType>('posts')
  const loadingRef = ref<HTMLDivElement | null>(null)
  let observer: IntersectionObserver | null = null
  const showSortPopover = ref(false)

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

  const loadMore = async () => {
    const currentState = communityStore.mine[currentTab.value as keyof MineState]
    if (currentState.modelListPathParams.current >= 100) return

    try {
      const newData = generateMockData(currentState.models.length + 1, 12)
      currentState.models.push(...newData)
      currentState.modelListPathParams.current++
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const fetchData = async () => {
    const currentState = communityStore.mine[currentTab.value as keyof MineState]
    currentState.models = []
    currentState.modelListPathParams.current = 1

    try {
      currentState.models = generateMockData(1, 12)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const switchTab = (tab: TabType) => {
    console.log('switchTab', tab)
    currentTab.value = tab
    fetchData()
  }

  watch(currentTab, () => {
    fetchData()
  })

  onMounted(() => {
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
</script>

<template>
  <div class="p-6 min-h-screen">
    <MineTabs v-model="currentTab" @update:model-value="switchTab">
      <template #posts>
        <ModelFilterBar
          :show-sort-popover="showSortPopover"
          page="posts"
          @update:show-sort-popover="showSortPopover = $event"
        />
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <div class="text-white text-base font-medium">My Posts</div>
          </div>
          <button
            class="flex items-center px-4 py-2 bg-[#7C3AED] rounded-lg text-white text-sm font-medium"
          >
            + New Post
          </button>
        </div>
        <div class="playground-container">
          <div
            v-for="model in communityStore.mine.posts.models"
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
      </template>

      <template #forked>
        <ModelFilterBar
          :show-sort-popover="showSortPopover"
          page="forked"
          @update:show-sort-popover="showSortPopover = $event"
        />
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <div class="text-white text-base font-medium">My Forked</div>
          </div>
        </div>
        <div class="playground-container">
          <div
            v-for="model in communityStore.mine.forked.models"
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
      </template>
    </MineTabs>
    <!-- 加载更多指示器 -->
    <div ref="loadingRef" class="py-4 text-center">
      <!-- <div v-if="communityStore.mine[currentTab.value].modelListPathParams.current >= 100" class="text-white/60">
        没有更多数据了
      </div>
      <div v-else class="h-4"></div> -->
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
