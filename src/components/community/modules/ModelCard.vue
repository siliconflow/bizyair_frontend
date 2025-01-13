<script setup lang="ts">
  import { Model } from '@/types/model'
  import vDefaultPic from '@/components/modules/vDefaultPic.vue'
  import vTooltips from '@/components/modules/v-tooltip.vue'
  import vDialog from '@/components/modules/vDialog.vue'
  import ModelDetail from '@/components/community/detail/Index.vue'
  import { sliceString, formatNumber } from '@/utils/tool'
  import { useCommunityStore } from '@/stores/communityStore'
  import { ref, watch } from 'vue'

  defineOptions({
    name: 'ModelCard'
  })

  const communityStore = useCommunityStore()
  const dialogLoading = ref(true)
  const showDialog = ref(false)

  const props = defineProps({
    model: {
      type: Object as () => Model | null,
      default: null
    },
    mode: {
      type: String,
      default: 'publicity'
    },
    currentTab: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    imageLoaded: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['action', 'image-load', 'image-error'])

  const handleImageLoad = (e: Event) => {
    emit('image-load', e)
  }

  const handleImageError = (e: Event) => {
    emit('image-error', e)
  }

  const handleDetail = () => {
    dialogLoading.value = true
    showDialog.value = true
    communityStore.showCommunityDetail = true
  }

  const handleLoaded = () => {
    dialogLoading.value = false
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
          class="absolute left-2 top-3 min-w-[100px] h-[34px] flex items-center justify-start z-10 text-white font-inter text-base font-bold bg-[#25252566] backdrop-blur-sm px-2 rounded-[6px]"
        >
          {{ model.type }}
        </div>

        <div
          class="absolute right-3 top-3 min-w-[24px] h-[24px] flex items-center justify-center z-10"
          @click.prevent.stop="$emit('action', model)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            class="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform duration-200 cursor-pointer"
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

        <div
          class="relative aspect-[2/3] md:aspect-[3/4] lg:aspect-[2/3] overflow-hidden"
          @click.prevent="handleDetail"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]"
            :class="{ 'opacity-0': props.imageLoaded }"
          ></div>
          <img
            :src="model.versions?.[0]?.cover_urls"
            :alt="model.versions?.[0]?.version || model.name"
            :crossorigin="
              typeof model.versions?.[0]?.cover_urls === 'string' &&
              model.versions?.[0]?.cover_urls?.startsWith('blob:')
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

        <div
          class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-black/30"
        >
          <vTooltips :tips="model.name">
            <h3 class="text-base text-white font-medium mb-2 truncate">
              {{ sliceString(model.name, 24) }}
            </h3>
          </vTooltips>
          <div class="flex items-center space-x-3 text-white/90 text-xs">
            <span
              v-if="model?.type === 'Workflow' && model?.counter?.downloaded_count"
              class="flex items-center space-x-1"
            >
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
              <span class="opacity-80">{{ formatNumber(model?.counter?.downloaded_count) }}</span>
            </span>
            <span v-else class="flex items-center space-x-1">
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
              <span class="opacity-80">{{ formatNumber(model?.counter?.used_count) }}</span>
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
              <span class="opacity-80">{{ formatNumber(model?.counter?.forked_count) }}</span>
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

    <v-dialog
      v-if="model?.versions?.[0] && showDialog"
      v-model:open="communityStore.showCommunityDetail"
      class="px-6 overflow-visible pb-6 z-10000 max-w-[90%] bg-[#353535]"
      layout-class="z-10000"
      content-class="custom-scrollbar max-h-[80vh] overflow-y-auto w-full rounded-tl-lg rounded-tr-lg custom-shadow"
      :title="model?.name || ''"
      @close="showDialog = false"
    >
      <div v-show="!dialogLoading">
        <ModelDetail
          :model-id="model?.id || ''"
          :version="model?.versions?.[0]"
          :mode="mode"
          :current-tab="currentTab"
          @loaded="handleLoaded"
        />
      </div>
      <div v-show="dialogLoading" class="flex justify-center items-center min-h-[300px]">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </v-dialog>
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
</style>
