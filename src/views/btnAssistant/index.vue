<template>
    <div class="btn-assistant" @click="toggleSidebar">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
        />
      </svg>
      <div class="text-box">
        <span class="text">{{ $t('app.assistant') }}</span>
        <!-- <span class="text-mini">助</span> -->
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // import { ref } from 'vue'
  import { useSidebarStore } from '../../stores/sidebarStore'
  const sidebarStore = useSidebarStore()
  const toggleSidebar = () => {
    // 如果当前没有选中的节点信息，添加提示信息
    if (!sidebarStore.nodeInfo) {
      console.log('没有选中的节点信息');
      // 可以选择是否添加一个默认的节点信息提示
    }
    
    // 切换侧边栏的显示/隐藏状态
    sidebarStore.toggleSidebar()
    console.log('助手按钮被点击，侧边栏状态:', sidebarStore.isOpen)
  }
  </script>
  
  <style scoped>
  .btn-assistant {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    color: var(--text-color);
    transition: all 0.3s;
    white-space: nowrap;
  }
  .btn-assistant:hover {
    background-color: var(--hover-bg-color);
    color: var(--primary-color);
  }
  .btn-assistant svg {
    margin-right: 8px;
    flex-shrink: 0;
  }
  .text-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .text {
    font-size: 14px;
    line-height: 1;
  }
  .text-mini {
    display: none;
    font-size: 12px;
    line-height: 1;
  }
  :global(.is-mini-box) .text {
    display: none;
  }
  :global(.is-mini-box) .text-mini {
    display: block;
  }
  </style> 