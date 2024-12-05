<template>
  <div class="rounded-md">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, watch } from 'vue';

const props = defineProps({
  activeIndex: {
    type: Number,
    required: false,
    default: null,
  },
});

const internalActiveIndex = ref<number | null>(null);

const setActiveIndex = (index: number) => {
  internalActiveIndex.value = index;
};

watch(() => props.activeIndex, (newIndex) => {
  internalActiveIndex.value = newIndex;
  console.log('activeIndex', internalActiveIndex.value);
});

provide('activeIndex', internalActiveIndex);
provide('setActiveIndex', setActiveIndex);
</script>

<style scoped>
</style>