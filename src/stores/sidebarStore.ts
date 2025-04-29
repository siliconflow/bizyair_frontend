import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义节点信息的接口
interface NodeInfo {
  title: string;
  type: string;
  id: string;
  imageInfo?: {
    filename: string;
    url: string;
    path: string;
    base64?: string;
  } | null;
}

export const useSidebarStore = defineStore('sidebar', () => {
  const isOpen = ref(false)
  const nodeInfo = ref<NodeInfo | null>(null)

  function toggleSidebar() {
    isOpen.value = !isOpen.value
    console.log('toggleSidebar 调用，新状态:', isOpen.value)
  }

  function openSidebar() {
    isOpen.value = true
    console.log('openSidebar 调用，新状态:', isOpen.value)
  }

  function closeSidebar() {
    isOpen.value = false
    console.log('closeSidebar 调用，新状态:', isOpen.value)
  }

  function setNodeInfo(info: NodeInfo | null) {
    nodeInfo.value = info
    console.log('setNodeInfo 调用，新节点信息:', info)
  }

  return {
    isOpen,
    nodeInfo,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setNodeInfo
  }
})

// 创建全局可访问的单例
let _sidebarStore: ReturnType<typeof useSidebarStore> | null = null;

// 确保只创建一次store实例
export function getGlobalSidebarStore() {
  if (!_sidebarStore) {
    // 这里可能需要创建pinia实例，但通常在全局已经配置
    console.log('创建新的全局sidebarStore实例');
    // 此处不实际创建，在main.ts中会创建真正的实例
  }
  return _sidebarStore;
}

// 设置全局store实例
export function setGlobalSidebarStore(store: ReturnType<typeof useSidebarStore>) {
  _sidebarStore = store;
  console.log('全局sidebarStore实例已设置');
} 