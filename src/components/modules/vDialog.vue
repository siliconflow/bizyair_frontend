<script setup lang="ts">
import { NModal } from 'naive-ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits(['update:open'])
</script>

<template>
  <n-modal
    :show="open"
    @update:show="(value) => emit('update:open', value)"
    class="custom-card"
    preset="card"
    title="卡片预设"
    size="huge"
    :bordered="false"
  >
    <slot />
  </n-modal>
</template>
