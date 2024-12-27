<script setup lang="ts">
  defineOptions({
    name: 'WorkflowsContent'
  })

  import { ref, onMounted, onUnmounted, nextTick, inject } from 'vue'
  import ModelFilterBar from '@/components/community/moudles/ModelFilterBar.vue'
  import { useCommunityStore } from '@/stores/communityStore'

  import { get_model_list, get_workflow_json } from '@/api/model'
  import { useToaster } from '@/components/modules/toats'
  // import vImage from '@/components/modules/vImage.vue'

  const communityStore = useCommunityStore()

  const SCROLL_THRESHOLD = 100

  const loading = ref(false)
  const hasMore = ref(true)
  const hasPrevious = ref(false)
  const isLoadingPrevious = ref(false)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true

    try {
      const nextPage = communityStore.workflows.modelListPathParams.current + 1
      communityStore.workflows.modelListPathParams.current = nextPage

      const response = await get_model_list(
        communityStore.workflows.modelListPathParams,
        communityStore.workflows.filterState
      )

      if (response?.data) {
        communityStore.workflows.models = [
          ...communityStore.workflows.models,
          ...response.data.list
        ]
        communityStore.workflows.modelListPathParams.total = response.data.total
        hasMore.value = communityStore.workflows.models.length < response.data.total
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      useToaster.error(`Failed to load more data: ${error}`)
    } finally {
      loading.value = false
    }
  }

  const loadPrevious = async () => {
    if (isLoadingPrevious.value || !hasPrevious.value) return
    const container = document.querySelector('.scroll-container')
    if (!container || container.scrollTop > SCROLL_THRESHOLD) return

    isLoadingPrevious.value = true

    try {
      const prevPage = communityStore.workflows.modelListPathParams.current - 1
      if (prevPage < 1) {
        hasPrevious.value = false
        return
      }

      communityStore.workflows.modelListPathParams.current = prevPage
      const response = await get_model_list(
        communityStore.workflows.modelListPathParams,
        communityStore.workflows.filterState
      )

      if (response?.data) {
        communityStore.workflows.models = [
          ...response.data.list,
          ...communityStore.workflows.models
        ]
        communityStore.workflows.modelListPathParams.total = response.data.total
        hasPrevious.value = prevPage > 1
        hasMore.value = communityStore.workflows.models.length < response.data.total

        await nextTick()
        const firstNewItem = container.querySelector('.playground-container > div')
        if (firstNewItem) {
          firstNewItem.scrollIntoView({ behavior: 'auto', block: 'start' })
          container.scrollBy(0, 10)
        }
      }
    } catch (error) {
      useToaster.error(`Failed to load previous data: ${error}`)
    } finally {
      isLoadingPrevious.value = false
    }
  }

  const throttle = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
    let timer: number | null = null
    return (...args: Parameters<T>) => {
      if (timer) return
      timer = window.setTimeout(() => {
        fn(...args)
        timer = null
      }, delay)
    }
  }

  const handleScroll = throttle((e: Event) => {
    const container = e.target as HTMLElement
    showBackToTop.value = container.scrollTop > 500

    if (container.scrollTop < SCROLL_THRESHOLD && hasPrevious.value && !isLoadingPrevious.value) {
      loadPrevious()
    }
  }, 1000)

  const fetchData = async (resetScroll: boolean = false) => {
    loading.value = true
    try {
      const response = await get_model_list(
        communityStore.workflows.modelListPathParams,
        communityStore.workflows.filterState
      )

      if (response?.data) {
        communityStore.workflows.modelListPathParams.total = response.data.total || 0
        communityStore.workflows.models = response.data.list || []
        hasMore.value = communityStore.workflows.models.length < response.data.total
        hasPrevious.value = communityStore.workflows.modelListPathParams.current > 1

        if (resetScroll) {
          nextTick(() => {
            const container = document.querySelector('.scroll-container')
            if (container) {
              container.scrollTo({
                top: 0,
                behavior: 'auto'
              })
            }
          })
        }
      } else {
        communityStore.workflows.modelListPathParams.total = 0
        communityStore.workflows.models = []
        hasMore.value = false
        hasPrevious.value = false
      }
    } catch (error) {
      useToaster.error(`Failed to fetch model list: ${error}`)
      communityStore.workflows.modelListPathParams.total = 0
      communityStore.workflows.models = []
      hasMore.value = false
      hasPrevious.value = false
    } finally {
      loading.value = false
    }
  }

  const loadingRef = ref<HTMLDivElement | null>(null)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    fetchData()
    observer = new IntersectionObserver(
      throttle((entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      }, 800),
      {
        threshold: 0.1,
        rootMargin: '500px 0px',
        root: document.querySelector('.scroll-container')
      }
    )

    if (loadingRef.value) {
      observer.observe(loadingRef.value)
    }

    const container = document.querySelector('.scroll-container')
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
    const container = document.querySelector('.scroll-container')
    if (container) {
      container.removeEventListener('scroll', handleScroll)
    }
  })

  const showSortPopover = ref(false)

  const showBackToTop = ref(false)

  const scrollToTop = async () => {
    const container = document.querySelector('.scroll-container')
    if (!container) return

    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

    setTimeout(async () => {
      loading.value = true
      try {
        communityStore.workflows.modelListPathParams.current = 1
        await fetchData()
        hasMore.value = true
        hasPrevious.value = false
      } catch (error) {
        useToaster.error(`Failed to reset data: ${error}`)
      } finally {
        loading.value = false
      }
    }, 500)
  }

  const imageLoadStates = ref<Map<number | string, boolean>>(new Map())

  const handleImageLoad = (_event: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, true)
  }

  const handleImageError = (_event: Event, modelId: number | string) => {
    imageLoadStates.value.set(modelId, false)
  }
  const imageLoaded = (modelId: number | string) => imageLoadStates.value.get(modelId) ?? false

  const handleLoadWorkflow = async (versions: any) => {
    if (!versions || versions.length === 0){
      useToaster.error('No workflow found')
      return
    }
    const workflow = await get_workflow_json(versions[0].id, versions[0].sign)
    const comfyUIApp: any = inject('comfyUIApp')
    if(workflow && comfyUIApp && comfyUIApp.graph){
      comfyUIApp.graph.clear()
      await comfyUIApp.loadGraphData(workflow)
    }
    communityStore.showDialog = false
  }
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="px-6 pt-6 pb-0 sticky top-0 z-20 bg-[#121212]">
      <ModelFilterBar
        v-model:show-sort-popover="showSortPopover"
        page="workflows"
        @fetch-data="
          () => {
            communityStore.workflows.modelListPathParams.current = 1
            fetchData(true)
          }
        "
      />
    </div>

    <div class="flex-1 px-6 relative">
      <div class="scroll-container overflow-y-auto">
        <div v-if="hasPrevious" class="text-center py-4">
          <div v-if="isLoadingPrevious" class="text-white/60">加载历史数据...</div>
          <div v-else class="text-white/60 cursor-pointer hover:text-white" @click="loadPrevious">
            ↑ 加载更早的内容
          </div>
        </div>

        <div class="playground-container">
          <div
            v-for="model in communityStore.workflows.models"
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
              <div
                class="absolute right-3 top-3 min-w-[24px] h-[24px] flex items-center justify-center z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform duration-200 cursor-pointer"
                  @click="handleLoadWorkflow(model.versions)"
                >
                  <path
                    d="M5 3L19 12L5 21V3Z"
                    stroke="#F3F4F6"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="group-hover:stroke-[#7C3AEDCC] transition-colors duration-200"
                    filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.5))"
                  />
                </svg>
              </div>
              <div class="relative aspect-[2/3] md:aspect-[3/4] lg:aspect-[2/3] overflow-hidden">
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] animate-pulse"
                  :class="{ 'opacity-0': imageLoaded(model.id) }"
                ></div>
                <div class="w-full h-0 pb-[150%]"></div>
                <img
                  :src="model.versions?.[0]?.cover_urls"
                  :alt="model.versions?.[0]?.version || model.name"
                  class="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                  :class="{
                    'opacity-0': !imageLoaded(model.id),
                    'opacity-100 group-hover:scale-105': imageLoaded(model.id)
                  }"
                  @load="e => handleImageLoad(e, model.id)"
                  @error="e => handleImageError(e, model.id)"
                />
                <div
                  v-if="!imageLoaded(model.id)"
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <svg class="w-8 h-8 text-white/30 animate-spin" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                      fill="none"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>

              <div
                class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-black/30"
              >
                <h3 class="text-base text-white font-medium mb-2">{{ model.name }}</h3>
                <div class="flex items-center space-x-3 text-white/90 text-xs">
                  <span class="flex items-center space-x-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75M4.08333 5.83333L7 8.75M7 8.75L9.91667 5.83333M7 8.75V1.75"
                        stroke="#E5E7EB"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    <span class="opacity-80">{{
                      model.versions?.[0]?.counter?.downloads || 0
                    }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_1021_3310)">
                        <path
                          d="M9.09948 0.538851L9.09948 0.538843C9.10201 0.523701 9.09385 0.508778 9.07973 0.502729L9.09948 0.538851ZM9.09948 0.538851L8.13633 6.31781L8.03929 6.90001M9.09948 0.538851L8.03929 6.90001M8.03929 6.90001H8.62952M8.03929 6.90001H8.62952M8.62952 6.90001H13.3333C13.3459 6.90001 13.3575 6.90717 13.3631 6.91844L13.3631 6.91846M8.62952 6.90001L13.3631 6.91846M13.3631 6.91846C13.3687 6.92969 13.3675 6.94313 13.36 6.95323L13.3599 6.95335M13.3631 6.91846L13.3599 6.95335M13.3599 6.95335L6.95994 15.4867C6.95084 15.4988 6.93448 15.5033 6.9202 15.4973C6.90603 15.4913 6.89788 15.4763 6.9004 15.4612L7.86356 9.6822L7.96059 9.1M13.3599 6.95335L7.96059 9.1M7.96059 9.1H7.37037M7.96059 9.1H7.37037M7.37037 9.1H2.66663M7.37037 9.1H2.66663M2.66663 9.1C2.65402 9.1 2.64248 9.09288 2.63683 9.08159L2.66663 9.1ZM3.3333 8.23334L2.7333 9.03334L7.97452 6.9549C7.97451 6.95489 7.9745 6.95488 7.97449 6.95487C7.96816 6.94738 7.96546 6.93752 7.96707 6.92789L7.96707 6.92786L8.67416 2.68531L7.78097 2.30311L3.3333 8.23334ZM2.63682 9.08157C2.63117 9.07026 2.6324 9.05675 2.63997 9.04666L9.03994 0.513374C9.04916 0.501082 9.06559 0.496684 9.07972 0.502726L2.63682 9.08157Z"
                          stroke="#E5E7EB"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1021_3310">
                          <rect width="14" height="14" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span class="opacity-80">{{
                      model.versions?.[0]?.counter?.liked_count || 0
                    }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="14"
                      viewBox="0 0 15 14"
                      fill="none"
                    >
                      <path
                        d="M5.51083 7.88079L9.495 10.2025M9.48917 3.79746L5.51083 6.11913M12.75 2.91663C12.75 3.88312 11.9665 4.66663 11 4.66663C10.0335 4.66663 9.25 3.88312 9.25 2.91663C9.25 1.95013 10.0335 1.16663 11 1.16663C11.9665 1.16663 12.75 1.95013 12.75 2.91663ZM5.75 6.99996C5.75 7.96646 4.9665 8.74996 4 8.74996C3.0335 8.74996 2.25 7.96646 2.25 6.99996C2.25 6.03346 3.0335 5.24996 4 5.24996C4.9665 5.24996 5.75 6.03346 5.75 6.99996ZM12.75 11.0833C12.75 12.0498 11.9665 12.8333 11 12.8333C10.0335 12.8333 9.25 12.0498 9.25 11.0833C9.25 10.1168 10.0335 9.33329 11 9.33329C11.9665 9.33329 12.75 10.1168 12.75 11.0833Z"
                        stroke="#E5E7EB"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span class="opacity-80">{{
                      model.versions?.[0]?.counter?.forked_count || 0
                    }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="14"
                      viewBox="0 0 15 14"
                      fill="none"
                    >
                      <path
                        d="M4.58317 5.83329V12.8333M9.24984 3.42996L8.6665 5.83329H12.0673C12.2485 5.83329 12.4271 5.87546 12.5891 5.95646C12.7511 6.03746 12.892 6.15506 13.0007 6.29996C13.1093 6.44485 13.1828 6.61306 13.2152 6.79126C13.2476 6.96946 13.2381 7.15275 13.1873 7.32663L11.8282 11.9933C11.7575 12.2356 11.6101 12.4485 11.4082 12.6C11.2062 12.7514 10.9606 12.8333 10.7082 12.8333H2.83317C2.52375 12.8333 2.22701 12.7104 2.00821 12.4916C1.78942 12.2728 1.6665 11.976 1.6665 11.6666V6.99996C1.6665 6.69054 1.78942 6.39379 2.00821 6.175C2.22701 5.95621 2.52375 5.83329 2.83317 5.83329H4.44317C4.66022 5.83318 4.87293 5.77252 5.05739 5.65813C5.24186 5.54374 5.39075 5.38017 5.48734 5.18579L7.49984 1.16663C7.77492 1.17003 8.04568 1.23556 8.29189 1.35831C8.53809 1.48106 8.75338 1.65785 8.92166 1.87549C9.08993 2.09313 9.20686 2.34599 9.26368 2.61516C9.32051 2.88433 9.31578 3.16287 9.24984 3.42996Z"
                        stroke="#E5E7EB"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span class="opacity-80">{{
                      model.versions?.[0]?.counter?.liked_count || 0
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref="loadingRef" class="py-4 text-center mt-8">
          <div v-if="loading" class="text-white/60">加载中...</div>
          <!-- <div v-else-if="!hasMore" class="text-white/60">没有更多数据了</div> -->
          <div v-else class="h-8"></div>
        </div>
      </div>
    </div>

    <div
      v-show="showBackToTop"
      class="fixed right-8 bottom-8 z-50 cursor-pointer transition-all duration-300 hover:scale-110"
      @click="scrollToTop"
    >
      <div
        class="w-10 h-10 rounded-full bg-[#7C3AED] bg-opacity-80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          class="text-white"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .scroll-container {
    height: calc(100vh - 140px);
    margin-top: 1rem;
    position: relative;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
    -webkit-overflow-scrolling: touch;
  }

  .scroll-container::-webkit-scrollbar {
    width: 4px;
    position: absolute;
    right: 0;
  }

  .scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  .scroll-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }

  .playground-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    padding-right: 12px;
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

  .fixed {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  img {
    transition:
      opacity 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .opacity-0 {
    opacity: 0;
  }

  .opacity-100 {
    opacity: 1;
  }
</style>
