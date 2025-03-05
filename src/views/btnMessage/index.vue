<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <div class="msg-container" @click="showMessage = true">
        <n-badge :dot="hasUnread" processing>
          <span class="msg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15.019 17h-6.04m6.04 0h3.614c1.876 0 1.559-1.86.61-2.804C15.825 10.801 20.68 3 11.999 3s-3.825 7.8-7.243 11.196c-.913.908-1.302 2.804.61 2.804H8.98m6.039 0c0 1.925-.648 4-3.02 4s-3.02-2.075-3.02-4"
              />
            </svg>
          </span>
        </n-badge>
      </div>
    </template>
    message
  </n-tooltip>

  <MessageBox :show="showMessage" @update:show="updateMessage" />
</template>

<script setup lang="ts">
  import MessageBox from '@/components/message-box/Index.vue'
  import { useNotificationStore } from '@/stores/notificationStore'
  import { ref, watch } from 'vue'
  import { NTooltip, NBadge } from 'naive-ui'

  const showMessage = ref(false)
  const updateMessage = (show: boolean) => {
    showMessage.value = show
  }

  const notificationStore = useNotificationStore()
  const hasUnread = ref(notificationStore.totalUnreadCount > 0)

  watch(
    () => notificationStore.totalUnreadCount,
    newVal => {
      console.log('未读消息状态变化:', newVal)
      hasUnread.value = newVal > 0
    },
    { immediate: true }
  )
</script>

<style scoped lang="less">
  .msg-container {
    cursor: pointer;
    position: relative;
  }

  .msg {
    display: block;
    width: 28px;
    height: 28px;
    padding: 6px;
    box-sizing: border-box;
    border-radius: 20px;
    margin-left: 8px;
    background-color: rgba(0, 0, 0, 0.2);
    svg {
      width: 16px;
      height: 16px;
    }
  }

  :deep(.n-badge) {
    .n-badge-sup {
      height: 6px !important;
      width: 6px !important;
      padding: 0 !important;
      min-width: 6px !important;
      left: 25px !important;
      bottom: calc(100% - 12px) !important;
    }
  }
</style>
