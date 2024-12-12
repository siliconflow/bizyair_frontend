<template>
  <div>
    <div class="cursor-pointer" @click="handleClick">
      <slot name="title"></slot>
    </div>
    <div v-show="isOpen">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { inject, computed, Ref } from 'vue'

  const props = defineProps({
    index: {
      type: Number,
      required: true
    }
  })

  const activeIndex = inject<Ref<number | null>>('activeIndex')
  const setActiveIndex = inject<(index: number) => void>('setActiveIndex')

  const isOpen = computed(() => activeIndex?.value === props.index)

  const emit = defineEmits<{
    (e: 'toggle', index: number): void
  }>()

  const handleClick = () => {
    if (setActiveIndex) {
      setActiveIndex(props.index)
      emit('toggle', props.index)
    }
  }
</script>

<style scoped></style>
