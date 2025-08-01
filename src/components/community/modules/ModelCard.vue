<script setup lang="ts">
  // import { Model } from '@/types/model'
  import vDefaultPic from '@/components/modules/vDefaultPic.vue'
  import vTooltips from '@/components/modules/v-tooltip.vue'
  import { sliceString, formatNumber } from '@/utils/tool'
  import { useCommunityStore } from '@/stores/communityStore'
  import { useDictStore } from '@/stores/dictStore'
  import { ref, watch, onMounted, computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({
    name: 'ModelCard'
  })

  const { t } = useI18n()
  const communityStore = useCommunityStore()
  const dialogLoading = ref(true)
  const showDialog = ref(false)
  const imgSrc = ref('')
  const tagsStore = useDictStore()
  const props = defineProps<{
    model?: any
    imageLoaded?: boolean
    loading?: boolean
  }>()

  const emit = defineEmits(['action', 'image-load', 'image-error'])

  const isHovering = ref(false)

  const actionTooltipText = computed(() => {
    return props.model?.type === 'Workflow'
      ? t('community.modelCard.tooltips.loadWorkflow')
      : t('community.modelCard.tooltips.addNode')
  })

  const handleImageLoad = (e: Event) => {
    emit('image-load', e)
  }

  const handleImageError = (e: Event) => {
    emit('image-error', e)
  }

  const handleDetail = (modelId: number, versionId: number) => {
    communityStore.setAndShowCommunityDetail(modelId, versionId)
  }

  watch(
    () => communityStore.showCommunityDetail,
    newVal => {
      if (!newVal) {
        setTimeout(() => {
          showDialog.value = false
          dialogLoading.value = true
        }, 300)
      }
    }
  )

  watch(
    () => showDialog.value,
    newVal => {
      if (!newVal) {
        communityStore.showCommunityDetail = false
      }
    }
  )

  watch(
    () => props.model?.versions?.[0]?.cover_urls,
    newUrls => {
      if (newUrls && Array.isArray(newUrls) && newUrls.length > 0) {
        const timestamp = new Date().getTime()
        const url = newUrls[0]
        imgSrc.value = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`
      }
    }
  )

  onMounted(async () => {
    const coverUrls = props.model?.versions?.[0]?.cover_urls
    if (coverUrls && Array.isArray(coverUrls) && coverUrls.length > 0) {
      const timestamp = new Date().getTime()
      const url = coverUrls[0]
      imgSrc.value = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`
    }
  })

  const isVideo = computed(() => {
    if (!imgSrc.value) return false
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
    const url = imgSrc.value.toLowerCase()
    return videoExtensions.some(ext => url.includes(ext))
  })

  const getVideoThumbnail = (videoUrl: string) => {
    if (videoUrl.includes('x-oss-process=video/snapshot')) {
      return videoUrl
    }
    const separator = videoUrl.includes('?') ? '&' : '?'
    return `${videoUrl}${separator}x-oss-process=video/snapshot,t_0000,f_jpg`
  }

  const currentMediaSrc = computed(() => {
    if (!imgSrc.value) return ''
    if (isVideo.value) {
      return isHovering.value ? imgSrc.value : getVideoThumbnail(imgSrc.value)
    }
    return imgSrc.value
  })

  const handleMouseEnter = () => {
    if (isVideo.value) {
      isHovering.value = true
    }
  }

  const handleMouseLeave = () => {
    if (isVideo.value) {
      isHovering.value = false
    }
  }
</script>

<template>
  <div
    class="group flex flex-col min-w-0 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-102"
  >
    <div
      class="relative flex flex-col flex-1 rounded-lg cursor-pointer overflow-hidden bg-[#1a1a1a]"
    >
      <template v-if="!loading && model">
        <div
          class="absolute left-2 top-3 h-[34px] flex items-center justify-start z-10 text-white font-inter text-base font-bold bg-[#25252566] backdrop-blur-sm px-2 rounded-[6px]"
        >
          {{ model.type }}
        </div>

        <div
          class="absolute right-3 top-4 min-w-[24px] h-[24px] flex items-center justify-center z-10"
          @click.prevent.stop="$emit('action', model)"
        >
          <vTooltips :tips="actionTooltipText">
            <div
              class="w-8 h-8 rounded-full bg-[#25252566] hover:bg-[#7C3AED] flex items-center justify-center transition-colors duration-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M2.91663 1.75L11.0833 7L2.91663 12.25V1.75Z"
                  stroke="#F3F4F6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </vTooltips>
        </div>

        <div
          class="relative aspect-[2/3] md:aspect-[3/4] lg:aspect-[2/3] overflow-hidden"
          @click.prevent="handleDetail(Number(model?.id), Number(model?.versions?.[0]?.id))"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]"
            :class="{ 'opacity-0': props.imageLoaded }"
          ></div>

          <!-- 视频显示（悬停时） -->
          <video
            v-if="isVideo && isHovering && currentMediaSrc"
            :src="currentMediaSrc"
            controls
            class="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            :class="{
              'opacity-0': !props.imageLoaded,
              'opacity-100 group-hover:scale-105': props.imageLoaded
            }"
            muted
            autoplay
            loop
            preload="metadata"
            @loadeddata="handleImageLoad"
            @error="handleImageError"
          />

          <img
            v-else-if="currentMediaSrc"
            :src="currentMediaSrc"
            :alt="model.versions?.[0]?.version || model.name"
            :crossorigin="
              typeof currentMediaSrc === 'string' && currentMediaSrc.startsWith('blob:')
                ? 'anonymous'
                : undefined
            "
            class="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            :class="{
              'opacity-0': !props.imageLoaded,
              'opacity-100 group-hover:scale-105': props.imageLoaded
            }"
            @load="handleImageLoad"
            @error="handleImageError"
          />

          <div v-if="!props.imageLoaded" class="absolute inset-0 flex items-center justify-center">
            <vDefaultPic />
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-black/0">
          <vTooltips :tips="model.name">
            <div class="flex items-center gap-2">
              <span
                v-if="
                  model.tags && model.tags.length > 0 && tagsStore.getHighestOrderTag(model.tags)
                "
                :class="tagsStore.getHighestOrderTag(model.tags)?.class || 'model-tag'"
                >{{
                  tagsStore.getHighestOrderTag(model.tags)?.label ||
                  t('community.modelCard.tags.new')
                }}</span
              >
              <h3 class="text-base text-white font-medium mb-2 truncate">
                {{ sliceString(model.name, 24) }}
              </h3>
            </div>
          </vTooltips>
          <div class="flex items-center space-x-3 text-white/90 text-xs">
            <span
              v-if="model?.type === 'Workflow' && model?.counter?.downloaded_count"
              class="flex items-center space-x-1"
            >
              <vTooltips :tips="t('community.modelCard.tooltips.downloaded')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    data-v-eb6fbda7=""
                    d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
                    stroke="#F9FAFB"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
              </vTooltips>
              <span class="opacity-80">{{ formatNumber(model?.counter?.downloaded_count) }}</span>
            </span>
            <span v-else class="flex items-center space-x-1">
              <vTooltips :tips="t('community.modelCard.tooltips.used')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3.33325 2L12.6666 8L3.33325 14V2Z"
                    stroke="#F9FAFB"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </vTooltips>
              <span class="opacity-80">{{ formatNumber(model?.counter?.used_count) }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <vTooltips :tips="t('community.modelCard.tooltips.forked')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M7.99992 1.33325L10.0599 5.50659L14.6666 6.17992L11.3333 9.42659L12.1199 14.0133L7.99992 11.8466L3.87992 14.0133L4.66659 9.42659L1.33325 6.17992L5.93992 5.50659L7.99992 1.33325Z"
                    stroke="#F9FAFB"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </vTooltips>
              <span class="opacity-80">{{ formatNumber(model?.counter?.forked_count) }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <vTooltips :tips="t('community.modelCard.tooltips.liked')">
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
              </vTooltips>
              <span class="opacity-80">{{ formatNumber(model?.counter?.liked_count) }}</span>
            </span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="animate-pulse">
          <div class="absolute left-3 top-3 w-[100px] h-[34px] bg-[#25252566] rounded-[6px]"></div>
          <div class="relative aspect-[2/3] md:aspect-[3/4] lg:aspect-[2/3] overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]"></div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <div class="h-6 w-2/3 bg-[#25252566] rounded mb-2"></div>
            <div class="flex items-center space-x-3">
              <div class="h-4 w-16 bg-[#25252566] rounded"></div>
              <div class="h-4 w-16 bg-[#25252566] rounded"></div>
              <div class="h-4 w-16 bg-[#25252566] rounded"></div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
  .hover\:scale-102:hover {
    transform: scale(1.02);
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

  .newTag {
    border-radius: 4px 4px 4px 0px;
    background: #c60003;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
    padding: 0px 8px;
    color: white;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    height: 20px;
  }

  .hotTag {
    border-radius: 4px 4px 4px 0px;
    background: #c60003;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
    padding: 0px 8px;
    color: white;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    height: 20px;
  }

  .model-tag {
    border-radius: 4px 4px 4px 0px;
    background: #c60003;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
    padding: 0px 8px;
    color: white;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    height: 20px;
  }
</style>
