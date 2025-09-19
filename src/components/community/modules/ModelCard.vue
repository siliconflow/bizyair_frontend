<script setup lang="ts">
  // import { Model } from '@/types/model'
  import vDefaultPic from '@/components/modules/vDefaultPic.vue'
  import vTooltips from '@/components/modules/v-tooltip.vue'
  import { sliceString, formatNumber } from '@/utils/tool'
  import { useCommunityStore } from '@/stores/communityStore'
  import { useDictStore } from '@/stores/dictStore'
  import { ref, watch, onMounted, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useServerModeStore } from '@/stores/isServerMode'

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
  const isServerMode = ref(false)

  const actionTooltipText = computed(() => {
    return props.model?.type === 'Workflow'
      ? t('community.modelCard.tooltips.loadWorkflow')
      : t('community.modelCard.tooltips.addNode')
  })

  // 判断是否应该显示徽章
  const shouldShowBadge = computed(() => {
    if (!props.model?.tags || !Array.isArray(props.model.tags)) {
      return false
    }

    // 获取所有标签数据
    const allTags = tagsStore.getDict('tags') || []

    // 查找 class 为 'item_right_top' 的标签（或者使用其他字段如 type）
    const rightTopTag = allTags.find((tag: any) => tag.class === 'item_right_top')

    if (!rightTopTag) {
      return false
    }

    // 检查 model.tags 是否包含该标签的 id
    return props.model.tags.includes(rightTopTag.id)
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
        // const timestamp = new Date().getTime()
        // const url = newUrls[0]
        // imgSrc.value = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`
        imgSrc.value = newUrls[0]
      }
    }
  )

  onMounted(async () => {
    const serverModeStore = useServerModeStore()
    isServerMode.value = await serverModeStore.setIsServerMode()
    const coverUrls = props.model?.versions?.[0]?.cover_urls
    if (coverUrls && Array.isArray(coverUrls) && coverUrls.length > 0) {
      // const timestamp = new Date().getTime()
      // const url = coverUrls[0]
      // imgSrc.value = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`
      imgSrc.value = coverUrls[0]
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
          v-if="
            (isServerMode && model?.type !== 'Detection' && model?.type !== 'Other') ||
            (!isServerMode &&
              (model?.type === 'LoRA' ||
                model?.type === 'Controlnet' ||
                model?.type === 'Checkpoint' ||
                model?.type === 'Workflow'))
          "
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
          <div v-if="shouldShowBadge" class="absolute right-1 -top-1">
            <svg
              width="48"
              height="49"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
            >
              <path
                d="M41.4984 2.72685C39.8578 2.6331 5.63904 2.72685 5.63904 2.72685C5.63908 5.77372 5.70935 4.1331 5.63904 5.77372V45.2893C5.63904 45.3222 5.63904 45.3503 5.64373 45.3831C5.64373 45.3972 5.64373 45.4112 5.64841 45.43C5.64841 45.444 5.64841 45.4628 5.6531 45.4768C5.6531 45.4956 5.65779 45.5144 5.65779 45.5331C5.65779 45.5472 5.66248 45.5565 5.66248 45.5706C5.66716 45.5893 5.66716 45.6128 5.67185 45.6315C5.67185 45.6409 5.67654 45.6503 5.67654 45.6643C5.68123 45.6831 5.68591 45.7065 5.6906 45.7253C5.69529 45.7347 5.69529 45.744 5.69529 45.7534L5.70935 45.8097C5.71404 45.819 5.71404 45.8331 5.71873 45.8425C5.72341 45.8612 5.7281 45.88 5.73748 45.894C5.74216 45.9081 5.74685 45.9175 5.75154 45.9315C5.75623 45.9456 5.7656 45.9644 5.77029 45.9784L5.78435 46.0206C5.78904 46.0347 5.79841 46.0487 5.8031 46.0628C5.80779 46.0768 5.81716 46.0956 5.82185 46.1097C5.82654 46.119 5.83123 46.1331 5.8406 46.1425C5.84998 46.1612 5.85935 46.1753 5.86404 46.194C5.86873 46.2034 5.87341 46.2128 5.88279 46.2222C5.89216 46.2409 5.90154 46.255 5.91091 46.2737C5.9156 46.2831 5.92029 46.2925 5.92966 46.3018C5.93904 46.3206 5.9531 46.3347 5.96248 46.3534C5.96716 46.3628 5.97654 46.3722 5.98123 46.3815C5.9906 46.4003 6.00466 46.4144 6.01873 46.4331C6.0281 46.4425 6.03279 46.4518 6.04216 46.4612C6.05154 46.4753 6.0656 46.4894 6.07498 46.5034C6.08435 46.5175 6.09841 46.5269 6.10779 46.5409C6.11716 46.5503 6.12654 46.5644 6.13591 46.5737C6.15935 46.5972 6.1781 46.6206 6.20154 46.644C6.22498 46.6675 6.24841 46.6862 6.27185 46.7097C6.28123 46.719 6.29529 46.7284 6.30466 46.7378C6.31873 46.7472 6.3281 46.7612 6.34216 46.7706C6.35623 46.7847 6.37029 46.794 6.38435 46.8034C6.39373 46.8128 6.4031 46.8175 6.41248 46.8268C6.43123 46.8409 6.44529 46.8503 6.46404 46.8643C6.47341 46.869 6.48279 46.8784 6.49216 46.8831C6.51091 46.8925 6.52498 46.9065 6.54373 46.9159C6.5531 46.9206 6.56247 46.9253 6.57185 46.9347C6.5906 46.944 6.60466 46.9534 6.62341 46.9628C6.63279 46.9675 6.64216 46.9722 6.65154 46.9815C6.67029 46.9909 6.68435 47.0003 6.7031 47.005C6.71248 47.0097 6.72654 47.0143 6.73591 47.0237C6.74997 47.0331 6.76872 47.0378 6.78279 47.0425C6.79685 47.0472 6.81091 47.0565 6.82498 47.0612L6.86716 47.0753C6.88123 47.08 6.89998 47.0893 6.91404 47.094C6.9281 47.0987 6.93748 47.1034 6.95154 47.1081C6.97029 47.1128 6.98904 47.1222 7.0031 47.1269C7.01247 47.1315 7.02654 47.1315 7.03591 47.1362L7.09216 47.1503C7.10154 47.155 7.11091 47.155 7.12498 47.1597C7.14373 47.1644 7.16716 47.169 7.18591 47.1737C7.19529 47.1737 7.20466 47.1784 7.21873 47.1784C7.23748 47.1831 7.26091 47.1878 7.27966 47.1878C7.29373 47.1878 7.3031 47.1925 7.31716 47.1925C7.33591 47.1972 7.35466 47.1972 7.37341 47.1972C7.38748 47.1972 7.40623 47.2018 7.42029 47.2018C7.43435 47.2018 7.44841 47.2065 7.46716 47.2065C7.49998 47.2065 7.5281 47.2112 7.56091 47.2112C7.59373 47.2112 7.62654 47.2112 7.65466 47.2065C7.66873 47.2065 7.68279 47.2065 7.70154 47.2018C7.7156 47.2018 7.73435 47.2019 7.74841 47.1972C7.76716 47.1972 7.78591 47.1925 7.80466 47.1925C7.81873 47.1925 7.8281 47.1878 7.84216 47.1878C7.86091 47.1831 7.88435 47.1831 7.9031 47.1784C7.91248 47.1784 7.92185 47.1737 7.93591 47.1737C7.95466 47.169 7.9781 47.1644 7.99685 47.1597C8.00623 47.155 8.0156 47.155 8.02966 47.1503L8.08591 47.1362C8.09529 47.1315 8.10935 47.1315 8.11873 47.1269C8.13748 47.1222 8.15623 47.1175 8.17029 47.1081C8.18435 47.1034 8.19373 47.0987 8.20779 47.094C8.22185 47.0893 8.2406 47.08 8.25466 47.0753L8.29685 47.0612C8.31091 47.0565 8.32498 47.0472 8.33904 47.0425C8.3531 47.0378 8.37185 47.0284 8.38591 47.0237C8.39529 47.019 8.40935 47.0143 8.41873 47.005C8.43748 46.9956 8.45154 46.9862 8.47029 46.9815C8.47966 46.9768 8.48904 46.9722 8.49841 46.9628C8.51716 46.9534 8.53123 46.944 8.54998 46.9347C8.55935 46.93 8.56873 46.9253 8.5781 46.9159C8.59685 46.9065 8.6156 46.8925 8.62966 46.8831C8.63904 46.8784 8.64841 46.869 8.65779 46.8643C8.67654 46.855 8.6906 46.8409 8.70935 46.8268C8.71873 46.8175 8.7281 46.8128 8.73748 46.8034C8.75154 46.794 8.7656 46.78 8.78435 46.7706C8.79841 46.7612 8.80779 46.7519 8.82185 46.7378C8.83123 46.7284 8.84529 46.719 8.85466 46.7097C8.8781 46.6909 8.90154 46.6675 8.92029 46.644L23.2654 34.1222L38.1703 46.644C38.55 47.0237 39.0515 47.2112 39.5531 47.2065H39.5765C40.6359 47.2065 41.4984 46.3487 41.4984 45.2847C41.4984 45.2847 41.5594 7.46591 41.4984 5.81122C41.4984 4.12959 41.4984 4.76965 41.4984 2.72685Z"
                fill="#DC2626"
              />
              <rect
                x="5.6217"
                y="19.7309"
                width="35.8941"
                height="10.4318"
                rx="2"
                fill="url(#pattern0_2578_7109)"
              />
              <rect
                x="13.6541"
                y="4.70111"
                width="19.8295"
                height="16"
                rx="2"
                fill="url(#pattern1_2578_7109)"
              />
              <defs>
                <pattern
                  id="pattern0_2578_7109"
                  patternContentUnits="objectBoundingBox"
                  width="1"
                  height="1"
                >
                  <use
                    xlink:href="#image0_2578_7109"
                    transform="matrix(0.00301187 0 0 0.0103633 -0.56617 0)"
                  />
                </pattern>
                <pattern
                  id="pattern1_2578_7109"
                  patternContentUnits="objectBoundingBox"
                  width="1"
                  height="1"
                >
                  <use xlink:href="#image0_2578_7109" transform="scale(0.00545189 0.00675676)" />
                </pattern>
                <image
                  id="image0_2578_7109"
                  width="520"
                  height="148"
                  preserveAspectRatio="none"
                  xlink:href="data:image/png;base64,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"
                />
              </defs>
            </svg>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-black/0">
          <div class="flex items-center gap-2">
            <span
              v-if="model.tags && model.tags.length > 0 && tagsStore.getHighestOrderTag(model.tags)"
              :class="tagsStore.getHighestOrderTag(model.tags)?.class || 'model-tag'"
              >{{
                tagsStore.getHighestOrderTag(model.tags)?.label || t('community.modelCard.tags.new')
              }}</span
            >
            <span v-else>
              <vTooltips :tips="t('community.modelCard.tooltips.cloud')">
                <span
                  v-if="
                    model.type === 'Workflow' &&
                    model.versions.filter((version: any) => version.draft_id).length > 0
                  "
                  className="text-xs text-white bg-[#7C3AED] px-1 inline-block h-[18px] rounded"
                >
                  ☁️
                </span>
              </vTooltips>
            </span>
            <vTooltips :tips="model.name">
              <h3 class="text-base text-white font-medium mb-2 truncate">
                {{ sliceString(model.name, 24) }}
              </h3>
            </vTooltips>
          </div>
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
