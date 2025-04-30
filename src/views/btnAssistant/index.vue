<template>
  <div class="btn-assistant" @click="toggleSidebar">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024">
      <path
        fill="currentColor"
        d="M512 85.333333c235.648 0 426.666667 191.018667 426.666667 426.666667 0 231.68-184.618667 420.181333-414.72 426.496L512 938.666667H42.666667l147.072-147.029334A425.002667 425.002667 0 0 1 85.333333 512C85.333333 276.352 276.352 85.333333 512 85.333333z m0 85.333334a341.333333 341.333333 0 0 0-341.333333 341.333333c0 78.805333 26.709333 153.258667 74.794666 213.248l8.704 10.410667 52.138667 60.074666L248.661333 853.333333h262.186667l10.752-0.128A341.333333 341.333333 0 0 0 512 170.666667zM364.8 597.333333c29.866667 50.773333 84.053333 85.333333 147.2 85.333334a169.813333 169.813333 0 0 0 142.336-77.44L659.2 597.333333h71.253333a234.453333 234.453333 0 0 1-433.194666 8.96L293.546667 597.333333h71.253333z"
      />
    </svg>
    <div class="text-box">
      <span class="text">{{ $t('app.assistant') }}</span>
      
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
      console.log('没有选中的节点信息')
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
