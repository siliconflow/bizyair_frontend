<script setup lang="ts">
import { ref, onMounted, onUnmounted, PropType } from 'vue'
import { Model } from '@/types/model'
import Grid from 'vue-virtual-scroll-grid'
import ModelCard from './ModelCard.vue'
import LoadingOverlay from './LoadingOverlay.vue'
import EmptyState from './EmptyState.vue'
import BackToTop from './BackToTop.vue'

defineOptions({
  name: 'BaseModelGrid'
})

 defineProps({
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
  onFetchData: {
    type: Function as PropType<(pageNumber: number, pageSize: number) => Promise<unknown[]>>,
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

const emit = defineEmits(['scroll', 'loadMore', 'showDetail', 'scrollToTop'])

const scrollState = ref({
  ratio: 0,
  showBackToTop: false,
  timer: null as number | null
})

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
  scrollState.value.showBackToTop = container.scrollTop > 500
  emit('scroll', e)
}, 100)

const loadingRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    throttle((entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        emit('loadMore')
      }
    }, 800),
    {
      threshold: 0.1,
      rootMargin: '100px 0px',
      root: document.querySelector('.scroll-container')
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
  if (scrollState.value.timer) {
    window.clearTimeout(scrollState.value.timer)
  }
})
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 px-6 relative overflow-hidden">
      <LoadingOverlay v-if="loading" />
      <div class="scroll-container overflow-y-auto px-2" @scroll="handleScroll">
        <EmptyState v-if="!loading && (!models || models.length === 0)" />

        <transition-group v-else name="grid" tag="div" class="grid-container">
          <Grid
            :key="cacheKey"
            :length="total"
            :page-size="pageSize"
            :page-provider="onFetchData"
            :cache-size="1"
            :scroll-behavior="'smooth'"
            class="grid"
          >
            <template #probe>
              <div class="item">
                <div class="animate-pulse bg-gray-700 h-full w-full rounded-lg"></div>
              </div>
            </template>

            <template #placeholder="{ style }">
              <ModelCard :loading="true" :style="style" />
            </template>

            <template #default="{ item: model, style }">
              <ModelCard
                :model="model"
                :style="style"
                :image-loaded="imageLoadStates.get(model.id) ?? false"
                @action="onModelAction(model)"
                @detail="emit('showDetail', model)"
                @image-load="e => onImageLoad(e, model.id)"
                @image-error="e => onImageError(e, model.id)"
              />
            </template>
          </Grid>
        </transition-group>
      </div>
    </div>

    <BackToTop 
      v-show="scrollState.showBackToTop"
      @click="emit('scrollToTop')" 
    />
  </div>
</template>

<style scoped>
.scroll-container {
  height: calc(80vh - 140px);
  margin-top: 1rem;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  -webkit-overflow-scrolling: touch;
  min-height: 400px;
  z-index: 0;
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

.grid {
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(2, 1fr);
  min-height: 300px;
  position: relative;
  transition: opacity 0.3s ease-in-out;
  align-items: start;
  height: auto;
  padding-bottom: 60px;
  margin-bottom: 40px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 992px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1440px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1650px) {
  .grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 1890px) {
  .grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

.grid-enter-active,
.grid-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
}

.item {
  background-color: transparent;
  min-height: 300px;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-container {
  padding-bottom: 40px;
}
</style> 