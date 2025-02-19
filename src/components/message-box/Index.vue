<template>
  <n-modal
    v-model:show="props.show"
    class="w-[80vw] max-w-[1200px]"
    preset="card"
    :style="{ width: '80vw', maxWidth: '1200px' }"
    :mask-closable="false"
    @negative-click="onNegativeClick"
  >
    <div class="flex h-[80vh]">
      <!-- 左侧菜单 -->
      <div class="w-[200px] border-r border-gray-200 pr-4">
        <div class="space-y-2">
          <div
            v-for="menu in menus"
            :key="menu.type"
            class="cursor-pointer rounded-lg p-3 flex items-center justify-between"
            :class="activeType === menu.type ? 'bg-primary text-white' : 'hover:bg-gray-100'"
            @click="handleMenuClick(menu.type)"
          >
            <span>{{ menu.label }}</span>
            <n-badge
              v-if="menu.unreadCount > 0"
              :value="menu.unreadCount > 99 ? '99+' : menu.unreadCount"
              :max="99"
            />
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="flex-1 pl-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">{{ currentMenuTitle }}</h3>
          <n-select v-model:value="filterType" :options="filterOptions" class="w-[200px]" />
        </div>

        <MessageList :type="activeType" :filter="filterType" @mark-read="handleMarkRead" />
      </div>
    </div>
  </n-modal>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import { NModal, NBadge, NSelect } from 'naive-ui'
  import MessageList from './modules/MessageList.vue'
  import { NotificationType } from './types'

  const props = defineProps<{
    show: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:show', value: boolean): void
  }>()

  const onNegativeClick = () => {
    emit('update:show', false)
  }

  // 菜单配置
  const menus = ref([
    {
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      label: '官方通知',
      unreadCount: 3
    },
    {
      type: NotificationType.USER_FORK,
      label: '用户复刻',
      unreadCount: 2
    },
    {
      type: NotificationType.USER_LIKE,
      label: '收到的赞',
      unreadCount: 5
    }
  ])

  const activeType = ref<NotificationType>(NotificationType.SYSTEM_ANNOUNCEMENT)

  const filterOptions = [
    { label: '全部', value: 'all' },
    { label: '未读', value: 'unread' },
    { label: '已读', value: 'read' }
  ]

  const filterType = ref('all')

  const currentMenuTitle = computed(() => {
    return menus.value.find(menu => menu.type === activeType.value)?.label
  })

  const handleMenuClick = (type: NotificationType) => {
    activeType.value = type
  }

  const handleMarkRead = (id: number) => {
    // TODO: 实现标记已读逻辑
  }
</script>
