<template>
  <Teleport to="body">
    <div class="export-sidebar-wrapper" v-if="exportStore.showExportDialog" :style="{ width: `${sidebarWidth}px` }">
      <div class="resize-handle" @mousedown="startResize"></div>
      <div class="sidebar-header">
        <h2>{{ $t('export.title') || '导出' }}</h2>
        <div class="header-actions">
          <button class="close-btn interactive-element" @click="closeExportDialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="sidebar-content">
        <!-- 选中节点列表 -->
        <div class="selected-nodes-section" v-if="selectedNodes.length > 0">
          <h3>{{ $t('export.selectedNodes') || '选中节点' }}</h3>
          <div class="selected-nodes-list">
            <div v-for="(node, index) in selectedNodes" :key="index" class="selected-node-item">
              <div class="node-header">
                <div class="node-title-container">
                  <span class="node-title">{{ node.title }}</span>
                  <span class="node-type">({{ node.type || node.comfyClass }})</span>
                </div>
                <div class="node-actions">
                  <button 
                    class="delete-node-btn interactive-element" 
                    @click="removeNode(index)"
                    title="移除节点"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="node-widgets-header" v-if="node.widgets && node.widgets.length > 0">
                <button 
                  class="toggle-widgets-btn interactive-element" 
                  @click="toggleNodeWidgets(node)"
                  :title="node._hideWidgets ? '显示属性' : '隐藏属性'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      :d="node._hideWidgets ? 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z' : 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z'"
                    />
                  </svg>
                </button>
              </div>
              
              <div class="node-widgets" v-if="node.widgets && node.widgets.length > 0 && !node._hideWidgets">
                <div 
                  v-for="(widget, widgetIndex) in node.widgets" 
                  :key="`${index}-${widgetIndex}`" 
                  class="widget-item"
                >
                  <div class="widget-header">
                    <span class="widget-name">{{ widget.name }}:</span>
                    <button 
                      class="delete-widget-btn interactive-element" 
                      @click="removeWidget(node, widgetIndex)"
                      title="删除此属性"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                        />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- 根据widget类型显示不同控件 -->
                  <div class="widget-value-container">
                    <!-- 如果有options.values数组，显示select下拉框 -->
                    <select 
                      v-if="hasOptionsValues(widget)"
                      class="widget-select"
                      v-model="widget.value"
                      @change="updateNodeWidget(node, widget)"
                    >
                      <option v-for="option in widget.options.values" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                    <!-- 显示为一个input -->
                    <input 
                      v-else 
                      class="widget-input" 
                      v-model="widget.value"
                      @change="updateNodeWidget(node, widget)"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="export-actions">
            <button 
              class="export-btn" 
              @click="handleExport" 
              :disabled="selectedNodes.length === 0"
            >
              {{ $t('export.title') }}
            </button>
          </div>
        </div>
        <div v-else class="no-nodes-selected">
          <p>{{ $t('export.noNodesSelected') || '请点击节点以选择要导出的内容' }}</p>
          <p class="hint">{{ $t('export.selectionHint') || '紫色高亮为可点击选择的节点，橙色高亮为选中节点' }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useExportStore } from '@/stores/exportStore.ts'
import { convertToJsonSchema } from '@/utils/tool'


const exportStore = useExportStore()

// 侧边栏宽度相关变量
const sidebarWidth = ref(450) // 默认宽度
const minWidth = 300 // 最小宽度
const maxWidth = 800 // 最大宽度
const isResizing = ref(false)

// 获取节点信息
// const nodeInfo = computed(() => sidebarStore.nodeInfo)

// 存储选中节点信息的数组
const selectedNodes = ref<any[]>([])

// 节点ID映射，用于跟踪哪些节点已经被添加和修改
const nodeIdMap = ref<Record<string, boolean>>({})

// 检查widget是否有options.values数组
const hasOptionsValues = (widget: any): boolean => {
  return widget && 
    widget.options && 
    widget.options.values && 
    Array.isArray(widget.options.values) && 
    widget.options.values.length > 0;
}

// 导出
const handleExport = () => {
  if (selectedNodes.value.length === 0) return;
  
  // 格式化导出数据
  const exportData = formatExportData(selectedNodes.value);
  
  // 转换为JSON Schema格式
  const jsonSchema = convertToJsonSchema(exportData);
  
  // 打印导出数据
  console.log('导出数据:', JSON.stringify(jsonSchema, null, 2));
}

// 格式化导出数据为指定格式
const formatExportData = (nodes: any[]): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const node of nodes) {
    if (!node.id) continue;
    
    // 收集widget值作为inputs
    const inputs: Record<string, any> = {};
    if (node.widgets && node.widgets.length > 0) {
      for (const widget of node.widgets) {
        inputs[widget.name] = widget.value;
      }
    }
    
    // 创建节点数据结构
    result[node.id] = {
      inputs,
      class_type: node.comfyClass || node.type,
      _meta: {
        title: node.title
      }
    };
  }
  
  return result;
}

// 关闭导出对话框
const closeExportDialog = () => {
  // 先通知ComfyUI关闭导出模式，立即触发高亮关闭
  window.parent.postMessage({
    type: 'EXPORT_DIALOG_STATUS',
    isOpen: false
  }, '*')
  
  // 清空选中节点
  selectedNodes.value = []
  nodeIdMap.value = {}
  
  // 隐藏对话框
  exportStore.hideDialog()
}

// 从选中列表中移除节点
const removeNode = (index: number) => {
  if (index >= 0 && index < selectedNodes.value.length) {
    const nodeId = selectedNodes.value[index].id;
    
    // 从UI中移除节点
    selectedNodes.value.splice(index, 1);
    
    // 从映射中删除
    delete nodeIdMap.value[nodeId];
    
    // 通知ComfyUI重置该节点的高亮状态
    window.parent.postMessage({
      type: 'RESET_NODE_HIGHLIGHT',
      nodeId: nodeId
    }, '*');
  }
}

// 删除widget
const removeWidget = (node: any, widgetIndex: number) => {
  if (node.widgets && widgetIndex >= 0 && widgetIndex < node.widgets.length) {
    // 直接从数组中删除widget
    node.widgets.splice(widgetIndex, 1);
  }
}

// 切换节点widgets的显示/隐藏
const toggleNodeWidgets = (node: any) => {
  node._hideWidgets = !node._hideWidgets;
}

// 开始拖拽
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  // 防止选中文本
  e.preventDefault()
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  // 计算宽度 (窗口宽度 - 鼠标位置)
  const newWidth = window.innerWidth - e.clientX

  // 限制宽度范围
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    sidebarWidth.value = newWidth
    // 保存宽度到本地存储
    localStorage.setItem('bizyair-export-sidebar-width', newWidth.toString())
  }
}

// 停止拖拽
const stopResize = () => { 
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 处理接收到的节点数据，确保节点独立性
const processNodeData = (nodes: any[]): any[] => {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  const result: any[] = [];
  
  for (const node of nodes) {
    // 检查节点是否已经存在于列表中
    if (node.id && nodeIdMap.value[node.id]) {
      // 节点已经存在，不要替换它（保留用户的修改）
      continue;
    }
    
    // 这是一个新节点，添加到结果中
    if (node.id) {
      nodeIdMap.value[node.id] = true;
      result.push(node);
    }
  }
  
  return result;
}

// 监听来自ComfyUI的消息
const setupMessageListener = () => {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'EXPORT_SELECTED_NODES') {
      console.log('收到选中节点信息:', event.data.nodes);
      
      // 处理节点数据，确保不覆盖已有节点
      const newNodes = processNodeData(event.data.nodes);
      
      // 追加新节点而不是完全替换
      if (newNodes.length > 0) {
        selectedNodes.value = [...selectedNodes.value, ...newNodes];
      }
    }
  })
}

// 在window.bizyAirLib对象中注册更新选中节点的方法
// declare global {
//   interface Window {
//     bizyAirLib: {
//       updateExportNodes: (nodes: any[]) => void;
//       enableExportNodeSelection?: () => void;
//       disableExportNodeSelection?: () => void;
//       [key: string]: any;
//     }
//   }
// }

if (typeof window.bizyAirLib === 'undefined') {
  window.bizyAirLib = {} as any;
}

window.bizyAirLib.updateExportNodes = function(nodes: any[]) {
  console.log('通过全局对象更新选中节点信息:', nodes);
  
  // 处理节点数据，确保不覆盖已有节点
  const newNodes = processNodeData(nodes);
      
  // 追加新节点而不是完全替换
  if (newNodes.length > 0) {
    selectedNodes.value = [...selectedNodes.value, ...newNodes];
  }
};

// 通知ComfyUI打开导出模式
const notifyExportDialogOpen = async () => {
  console.log('通知ComfyUI打开导出模式');
  
  // 等待下一个DOM更新周期，确保对话框已显示
  await nextTick();
  
  // 发送消息激活节点高亮
  window.parent.postMessage({
    type: 'EXPORT_DIALOG_STATUS',
    isOpen: true
  }, '*');
  
  // 直接调用全局方法激活节点高亮（作为备份机制）
  if (window.bizyAirLib && typeof window.bizyAirLib.enableExportNodeSelection === 'function') {
    try {
      window.bizyAirLib.enableExportNodeSelection();
    } catch (error) {
      console.error('调用enableExportNodeSelection失败:', error);
    }
  }
}
 
// 监听导出对话框的显示状态
watch(() => exportStore.showExportDialog, (newValue) => {
  if (newValue) {   
    // 立即通知ComfyUI打开导出模式
    notifyExportDialogOpen();
  } else {
    // 通知关闭
    window.parent.postMessage({
      type: 'EXPORT_DIALOG_STATUS',
      isOpen: false
    }, '*');
    
    // 直接调用全局方法关闭节点高亮（作为备份机制）
    if (window.bizyAirLib && typeof window.bizyAirLib.disableExportNodeSelection === 'function') {
      try {
        window.bizyAirLib.disableExportNodeSelection();
      } catch (error) {
        console.error('调用disableExportNodeSelection失败:', error);
      } 
    } 
    // 清空选中节点
    selectedNodes.value = [];
    nodeIdMap.value = {};
  }
}, { immediate: true });

// 组件卸载前清理事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  
  // 确保导出模式关闭
  window.parent.postMessage({
    type: 'EXPORT_DIALOG_STATUS',
    isOpen: false
  }, '*');
});

onMounted(() => {
  // 从本地存储加载宽度设置
  const savedWidth = localStorage.getItem('bizyair-export-sidebar-width');
  if (savedWidth) {
    const width = parseInt(savedWidth);
    if (width >= minWidth && width <= maxWidth) {
      sidebarWidth.value = width;
    }
  }
  
  // 设置消息监听器
  setupMessageListener();
  
  // 如果对话框是打开的，立即通知ComfyUI
  if (exportStore.showExportDialog) {
    notifyExportDialogOpen();
  }
});

// 修改参数值时同步到ComfyUI节点
const updateNodeWidget = (node: any, widget: any) => {
  try {
    console.log(`发送参数更新: 节点=${node.title}, 参数=${widget.name}, 值=${widget.value}`);
    
    // 使用postMessage发送更新
    window.parent.postMessage({
      type: 'UPDATE_NODE_WIDGET',
      nodeId: node.id,
      widgetName: widget.name,
      newValue: widget.value
    }, '*');
  } catch (error) {
    console.error('更新节点参数时出错:', error);
  }
}
</script>

<style scoped>
.export-sidebar-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  background-color: #2d2d2d;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 99999;
  transition: width 0.1s ease;
  pointer-events: auto;
}

.resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%; 
  cursor: col-resize;
  background-color: transparent;
}

.resize-handle:hover,
.resize-handle:active {
  background-color: rgba(124, 58, 237, 0.3);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #333;
  border-bottom: 1px solid #444;
  flex-shrink: 0;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 16px;
  color: #fff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.selected-nodes-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 14px;
  color: #ccc;
}

.selected-nodes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selected-node-item {
  background-color: #333;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #444;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.node-title-container {
  display: flex;
  align-items: center;
}

.node-title {
  font-weight: bold;
  margin-right: 6px;
  color: #fff;
}

.node-type {
  font-size: 12px;
  color: #aaa;
}

.node-actions {
  display: flex;
  gap: 6px;
}

.delete-node-btn {
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.delete-node-btn:hover {
  background-color: rgba(248, 113, 113, 0.1);
}

.node-widgets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  margin-bottom: 6px;
  border-bottom: 1px solid #444;
  color: #aaa;
  font-size: 12px;
}

.toggle-widgets-btn {
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.toggle-widgets-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.node-widgets {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.widget-item {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  padding: 6px 8px;
  background-color: #3a3a3a;
  border-radius: 4px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.widget-name {
  font-weight: bold;
  color: #ccc;
}

.delete-widget-btn {
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 10px;
}

.delete-widget-btn:hover {
  color: #f87171;
  background-color: rgba(248, 113, 113, 0.1);
}

.widget-value-container {
  width: 100%;
}

.widget-select {
  width: 100%;
  background-color: #444;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
}

.widget-select:focus {
  outline: none;
  border-color: #7C3AED;
}

.widget-input {
  width: 100%;
  background-color: #444;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
}

.widget-input:focus {
  outline: none;
  border-color: #7C3AED;
}

.no-nodes-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  text-align: center;
  color: #aaa;
  background-color: #333;
  border-radius: 8px;
  padding: 20px;
}

.no-nodes-selected p {
  margin: 6px 0;
}

.no-nodes-selected .hint {
  font-size: 12px;
  opacity: 0.7;
  max-width: 300px;
}

.interactive-element {
  transition: transform 0.1s ease;
}

.interactive-element:active {
  transform: scale(0.97);
}

.export-actions {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  margin-top: 16px;
  border-top: 1px solid #444;
}

.export-btn {
  background-color: #7C3AED;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background-color: #6D28D9;
}

.export-btn:active {
  transform: scale(0.98);
}

.export-btn:disabled {
  background-color: #4B5563;
  cursor: not-allowed;
  opacity: 0.6;
}
</style> 