<template>
  <div class="h-[calc(80vh-100px)] relative">
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>

    <n-virtual-list
      v-if="messages.length > 0"
      :items="messages"
      :item-size="120"
      :min-size="10"
      @scroll="handleScroll"
    >
      <template #default="{ item }">
        <n-card
          class="mb-4 message-card"
          :bordered="false"
          :style="cardStyle"
          :color="!item.read ? 'rgba(249, 250, 251, 0.05)' : undefined"
          @click="openDetail(item)"
        >
          <div class="flex items-center">
            <div v-if="item.relatedType === 'IMAGE'" class="w-[10%] flex items-center">
              <img :src="item.imageUrl" class="w-16 h-16 object-cover rounded" alt="" />
            </div>

            <div
              class="cursor-pointer"
              :class="['flex-1', item.relatedType === 'IMAGE' ? 'w-[80%] px-4' : 'w-[90%]']"
              @click.stop="openDetail(item)"
            >
              <div class="flex justify-between items-start w-full">
                <span class="font-medium text-white text-lg line-clamp-1 w-full">{{
                  item.title
                }}</span>
              </div>
              <div class="mt-2 text-gray-400 text-sm">
                {{ item.created_at }}
              </div>
            </div>

            <div class="w-[10%] flex items-center justify-end">
              <div v-if="!item.read" class="w-1.5 h-1.5 rounded-full bg-red-500 unread-dot" />
            </div>
          </div>
        </n-card>
      </template>
    </n-virtual-list>

    <div v-if="!loading && messages.length === 0" class="flex items-center justify-center h-full">
      <div class="text-center">
        <p class="text-gray-400">{{ $t('messageBox.noNotifications') }}</p>
      </div>
    </div>

    <detail-modal
      v-model="showDetail"
      :message="selectedMessage as any"
      @close="handleCloseDetail"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue'
  import { NVirtualList, NCard, NSpin } from 'naive-ui'
  import { NotificationType } from '../types'
  import DetailModal from './Detail.vue'
  import { useNotificationStore } from '@/stores/notificationStore'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const notificationStore = useNotificationStore()

  const props = defineProps<{
    type: NotificationType
    filter?: string
    selectedType?: number
  }>()

  const messages = computed(() => {
    return notificationStore.getNotificationsByType(props.type)
  })

  const loading = computed(() => {
    return notificationStore.getLoadingStatusByType(props.type)
  })

  const cardStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '0.375rem'
  }

  const showDetail = ref(false)
  const selectedMessage = ref<any | null>(null)

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    const { scrollTop, scrollHeight, clientHeight } = target
    if (scrollHeight - scrollTop - clientHeight < 50) {
      notificationStore.loadNotificationsByType(props.type)
    }
  }

  watch(
    () => [props.type, props.filter, props.selectedType],
    () => {
      if (props.type === NotificationType.SYSTEM_ANNOUNCEMENT) {
        notificationStore.setOfficialNoticesFilter({
          read_status: props.filter === 'all' ? null : props.filter,
          type: props.selectedType
        })

        notificationStore.loadOfficialNotices(true)
      } else {
        if (!notificationStore.getInitializedStatusByType(props.type)) {
          notificationStore.loadNotificationsByType(props.type, true)
        }
      }
    },
    { immediate: true }
  )

  const openDetail = (item: any) => {
    selectedMessage.value = item
    if (props.type === NotificationType.SYSTEM_ANNOUNCEMENT) {
      showDetail.value = true
      if (!item.read) {
        notificationStore.markAsRead(props.type, item.id)
      }
    }
  }

  const handleCloseDetail = () => {
    selectedMessage.value = null
  }
</script>

<style scoped lang="less">
  .message-card :deep(.n-card) {
    background-color: rgba(0, 0, 0, 0.6) !important;
    border-radius: 0.375rem;
    transition: all 0.2s ease-in-out;
    border-radius: 4px;
  }

  .message-card:hover :deep(.n-card__content) {
    background-color: #7c3aed !important;
    border-radius: 4px;
  }

  .message-card.unread :deep(.n-card) {
    background-color: rgba(249, 250, 251, 0.05) !important;
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .message-card:hover .unread-dot {
    width: 12px !important;
    height: 12px !important;
    transition: all 0.2s ease-in-out;
  }

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.n-scrollbar-rail) {
    display: none;
  }

  .loading-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    z-index: 10;
  }
</style>
