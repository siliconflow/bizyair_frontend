<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-badge dot processing>
        <span class="msg" @click="showMessage = true">
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
    </template>
    message
  </n-tooltip>

  <MessageBox :show="showMessage" @update:show="updateMessage" />
</template>

<script setup lang="ts">
  import MessageBox from '@/components/message-box/Index.vue'
  import { ref } from 'vue'
  import { NTooltip, NBadge } from 'naive-ui'
  const showMessage = ref(false)
  const updateMessage = (show: boolean) => {
    showMessage.value = show
  }
</script>

<style scoped lang="less">
  .msg {
    cursor: pointer;
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
</style>
