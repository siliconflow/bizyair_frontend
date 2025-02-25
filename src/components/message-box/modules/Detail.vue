<template>
  <n-modal
    :show="modelValue"
    preset="card"
    style="width: 600px; max-width: 90%"
    :title="message?.title"
    :bordered="false"
    :segmented="true"
    :mask-closable="true"
    @update:show="handleUpdateShow"
    @close="handleClose"
  >
    <div class="message-detail">
      <div class="message-date">{{ formatDate(message?.created_at) }}</div>
      <n-divider />
      <n-scrollbar style="height: calc(80vh - 120px)">
        <div class="message-content">
          <md-preview :modelValue="message?.content || ''" :preview-theme="isDark ? 'dark' : 'default'" />
        </div>
      </n-scrollbar>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NScrollbar, NDivider, useOsTheme } from 'naive-ui'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { Notification } from '@/types/message'

const props = defineProps<{
  modelValue: boolean
  message: Notification | null
}>()

const emit = defineEmits(['update:modelValue', 'close'])

const osThemeRef = useOsTheme()
const isDark = computed(() => osThemeRef.value === 'dark')

const handleUpdateShow = (value: boolean) => {
  emit('update:modelValue', value)
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const formatDate = (timestamp?: string | number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.message-detail {
  display: flex;
  flex-direction: column;
}

.message-date {
  font-size: 14px;
  color: var(--n-text-color-3);
  margin-bottom: 8px;
}

.message-content {
  padding: 0 4px;
}

:deep(.md-preview) {
  background-color: transparent;
}
</style>
