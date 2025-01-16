<script setup lang="ts">
import { NModal } from 'naive-ui'

defineProps<{
  open: boolean
}>()

const emit = defineEmits(['update:open'])
</script>

<template>
  <n-modal
    :show="open"
    class="custom-card"
    preset="card"
    title="卡片预设"
    size="huge"
    :bordered="false"
    @update:show="(value) => emit('update:open', value)"
  >
    <slot />
  </n-modal>
</template>
