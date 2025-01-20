<script setup lang="ts">
  import { ref, onMounted, onUnmounted, PropType, computed, watch } from 'vue'
  import { Model } from '@/types/model'
  import ModelCard from './ModelCard.vue'
  import LoadingOverlay from './LoadingOverlay.vue'
  import EmptyState from './EmptyState.vue'
  import BackToTop from './BackToTop.vue'
  import { NVirtualList } from 'naive-ui'
  import { debounce } from 'lodash-es'
  import type { VirtualListInst } from 'naive-ui'
  defineOptions({
    name: 'BaseModelGrid'
  })

  const props = defineProps({
    models: {
      type: Array as () => Model[],
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    cacheKey: {
      type: Number,
      required: true
    },
    onModelAction: {
      type: Function as PropType<(model: Model) => Promise<void>>,
      required: true
    },
    imageLoadStates: {
      type: Object as PropType<Map<number | string, boolean>>,
      required: true
    },
    onImageLoad: {
      type: Function as PropType<(e: Event, modelId: number | string) => void>,
      required: true
    },
    onImageError: {
      type: Function as PropType<(e: Event, modelId: number | string) => void>,
      required: true
    }
  })

  const virtualListInst = ref<VirtualListInst>()
  const emit = defineEmits(['scroll', 'loadMore', 'showDetail'])

  const scrollState = ref({
    ratio: 0,
    showBackToTop: false,
    timer: null as number | null
  })

  const loadMoreTrigger = ref<HTMLDivElement | null>(null)

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    const scrollTop = target.scrollTop

    scrollState.value.showBackToTop = scrollTop > 500

    const scrollBottom = scrollTop + target.clientHeight
    const scrollHeight = target.scrollHeight
    const scrollPercentage = (scrollBottom / scrollHeight) * 100

    if (scrollPercentage > 90 && !props.loading) {
      emit('loadMore')
    }

    emit('scroll', e)
  }

  const windowWidth = ref(window.innerWidth)

  const handleWindowResize = debounce(() => {
    windowWidth.value = window.innerWidth
  }, 100)

  onMounted(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          emit('loadMore')
        }
      },
      {
        root: document.querySelector('.scroll-container'),
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    if (loadMoreTrigger.value) {
      observer.observe(loadMoreTrigger.value)
    }

    window.addEventListener('resize', handleWindowResize)

    onUnmounted(() => {
      observer.disconnect()
      window.removeEventListener('resize', handleWindowResize)
    })
  })

  const columnsCount = computed(() => {
    const width = windowWidth.value
    if (width >= 1890) return 7
    if (width >= 1650) return 6
    if (width >= 1440) return 5
    if (width >= 992) return 4
    if (width >= 768) return 3
    return 2
  })

  const rows = computed(() => {
    if (!props.models) return []
    const result = []
    const count = columnsCount.value
    for (let i = 0; i < props.models.length; i += count) {
      const row = props.models.slice(i, i + count)
      result.push({
        id: `row-${i}`,
        models: row
      })
    }
    return result
  })

  const rowHeight = computed(() => {
    const width = windowWidth.value
    if (width >= 1890) return 340 // 7列
    if (width >= 1650) return 320 // 6列
    if (width >= 1440) return 300 // 5列
    if (width >= 992) return 280 // 4列
    if (width >= 768) return 260 // 3列
    return 240 // 2列
  })

  const virtualListProps = computed(() => ({
    items: rows.value,
    itemSize: rowHeight.value,
    style: {
      maxHeight: 'calc(80vh - 100px)',
      height: 'auto'
    },
    keyField: 'id',
    itemResizable: true,
    ignoreItemResize: false
  }))

  const backToTop = () => {
    virtualListInst.value?.scrollTo({ top: 0 })
  }

  watch(
    () => props.cacheKey,
    () => {
      virtualListInst.value?.scrollTo({ top: 0 })
      scrollState.value.showBackToTop = false
    }
  )
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 px-6 overflow-hidden main-container">
      <LoadingOverlay v-if="loading" />
      <div class="scroll-container">
        <EmptyState v-if="!loading && (!models || models.length === 0)" />
        <div v-else class="grid-container">
          <NVirtualList
            v-if="rows.length > 0"
            ref="virtualListInst"
            v-bind="virtualListProps"
            @scroll="handleScroll"
          >
            <template #default="{ item: row }">
              <div class="grid">
                <ModelCard
                  v-for="model in row.models"
                  :key="`${model.id}`"
                  :model="model"
                  :image-loaded="imageLoadStates.get(model.id) ?? false"
                  @action="onModelAction(model)"
                  @detail="emit('showDetail', model)"
                  @image-load="e => onImageLoad(e, model.id)"
                  @image-error="e => onImageError(e, model.id)"
                />
              </div>
            </template>
          </NVirtualList>
        </div>
      </div>
    </div>
    <BackToTop v-show="scrollState.showBackToTop" @click="backToTop" />
  </div>
</template>

<style scoped>
  .scroll-container {
    max-height: calc(100vh - 200px);
    height: auto;
    margin-top: 0.5rem;
    position: relative;
    min-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .virtual-list {
    width: 100%;
    height: auto !important;
    max-height: inherit;
    overflow-x: hidden !important;
    padding: 12px 20px 64px 20px;
    min-height: 300px;
  }

  .grid {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    position: relative;
    transition: opacity 0.3s ease-in-out;
    align-items: stretch;
    width: 100%;
    margin-bottom: 10px;
    z-index: 1;
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (min-width: 992px) {
    .grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (min-width: 1440px) {
    .grid {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  @media (min-width: 1650px) {
    .grid {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }
  }

  @media (min-width: 1890px) {
    .grid {
      grid-template-columns: repeat(7, minmax(0, 1fr));
    }
  }

  .grid-container {
    position: relative;
    height: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    max-width: 2000px;
    padding-bottom: 100px;
    padding-right: 6px;
    flex: 1;
  }

  :deep(.n-virtual-list::-webkit-scrollbar) {
    width: 6px;
    position: absolute;
    right: 0;
  }

  :deep(.n-virtual-list::-webkit-scrollbar-track) {
    background: transparent;
  }

  :deep(.n-virtual-list::-webkit-scrollbar-thumb) {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  :deep(.n-virtual-list::-webkit-scrollbar-thumb:hover) {
    background-color: rgba(255, 255, 255, 0.5);
  }

  :deep(.v-vl:not(.v-vl--show-scrollbar)) {
    padding: 10px 20px 100px 20px;
  }
</style>
