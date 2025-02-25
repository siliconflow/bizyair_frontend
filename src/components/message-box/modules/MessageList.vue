<template>
  <div class="h-[calc(80vh-100px)]">
    <n-virtual-list 
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
          :color="!item.readAt ? 'rgba(249, 250, 251, 0.05)' : undefined"
          @click="openDetail(item)"
        >
          <div class="flex items-center">
            <!-- 左侧图片区域 -->
            <div class="w-[10%] flex items-center" v-if="item.relatedType === 'IMAGE'">
              <img :src="item.imageUrl" class="w-16 h-16 object-cover rounded" alt="" />
            </div>

            <!-- 中间内容区域 -->
            <div class="cursor-pointer" :class="['flex-1', item.relatedType === 'IMAGE' ? 'w-[80%] px-4' : 'w-[90%]']"
                 @click.stop="openDetail(item)">
              <div class="flex justify-between items-start w-full">
                <span class="font-medium text-white text-lg line-clamp-1 w-full">{{ item.title }}</span>
              </div>
              <div class="mt-2 text-gray-400 text-sm">
                {{item.createdAt }}
              </div>
            </div>

            <!-- 右侧未读标记 -->
            <div class="w-[10%] flex items-center justify-end">
              <div v-if="!item.readAt" class="w-1.5 h-1.5 rounded-full bg-red-500 unread-dot" />
            </div>
          </div>
        </n-card>
      </template>
    </n-virtual-list>
    
    <!-- 添加详情模态框 -->
    <detail-modal
      v-model="showDetail"
      :message="selectedMessage"
      @close="handleCloseDetail"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import { NVirtualList, NCard } from 'naive-ui'
  import { NotificationType } from '../types'
  import { useDictStore } from '@/stores/dictStore'
  import { get_messages_list } from '@/api/message-box'
  import DetailModal from './Detail.vue'
  const tagsStore = useDictStore()

  const officialNotificationTypes = computed(() => {
    return tagsStore.getDict("official_notification_types")
  })

  const notificationTypes = computed(() => {
    return tagsStore.getDict("notification_types")
  })
  const props = defineProps<{
    type: NotificationType
    filter: string
  }>()

  const emit = defineEmits<{
    (e: 'mark-read', id: number): void
  }>()

  const messages = ref<Notification[]>([])
  const loading = ref(false)
  const lastPmId = ref<number | undefined>(undefined)
  const lastBroadcastId = ref<number | undefined>(undefined)

  const cardStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '0.375rem'
  }

  const showDetail = ref(false)
  const selectedMessage = ref<Notification | null>(null)

  const loadMessages = async () => {
    if (loading.value) return
    loading.value = true
    try {
      let types: number[] | undefined
      let notificationType;
      switch(props.type) {
        case NotificationType.SYSTEM_ANNOUNCEMENT:
          types = officialNotificationTypes.value
            .filter(item => item.value !== undefined)
            .map(item => Number(item.value))
          break
        
        case NotificationType.USER_LIKE:
        case NotificationType.USER_FORK:
          notificationType = notificationTypes.value.find(
            item => item.label === props.type
          )
          if (notificationType?.value !== undefined) {
            types = [Number(notificationType.value)]
          }
          break
        
        default:
          break
      }

      const params: Record<string, any> = {
        page_size: 10
      }
      
      if (lastPmId.value !== undefined) {
        params.last_pm_id = lastPmId.value
      }
      
      if (lastBroadcastId.value !== undefined) {
        params.last_broadcast_id = lastBroadcastId.value
      }
      
      if (props.filter !== 'all') {
        params.read_status = props.filter
      }
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'types' && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      if (types && types.length > 0) {
        types.forEach(type => {
          searchParams.append('types', String(type));
        });
      }

      console.log('params string', searchParams.toString());

      const res = await get_messages_list(Object.fromEntries(searchParams));
      
      if (res.data) {
        if (res.data.last_pm_id !== undefined) {
          lastPmId.value = res.data.last_pm_id
        }
        if (res.data.last_broadcast_id !== undefined) {
          lastBroadcastId.value = res.data.last_broadcast_id
        }
        
        if (res.data.messages && Array.isArray(res.data.messages)) {
          if (!lastPmId.value && !lastBroadcastId.value) {
            messages.value = [...res.data.messages]
          } else {
            messages.value = [...messages.value, ...res.data.messages]
          }
        }
      }
    } finally {
      loading.value = false
    }
  }

  const handleScroll = (event: {
    target: { scrollTop: number; scrollHeight: number; clientHeight: number }
  }) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadMessages()
    }
  }

  watch(
    () => [props.type, props.filter],
    () => {
      messages.value = []
      lastPmId.value = undefined
      lastBroadcastId.value = undefined
      loadMessages()
    }
  )

  onMounted(() => {
    loadMessages()
  })

  const openDetail = (item: Notification) => {
    selectedMessage.value = item
    showDetail.value = true
    
    // 如果消息未读，可以在这里标记为已读
    if (!item.readAt) {
      // 调用标记已读的API
      // markAsRead(item.id)
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
  background-color: #7C3AED !important;
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

/* 添加未读圆点的悬停效果 */
.message-card:hover .unread-dot {
  width: 12px !important;
  height: 12px !important;
  transition: all 0.2s ease-in-out;
}

/* 添加行截断样式 */
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


</style>
