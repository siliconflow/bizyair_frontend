<script setup lang="ts">
  import { ref, watch } from 'vue'
  const aspectRatio = ref<null | boolean>(null)
  const props = defineProps({
    src: String,
    alt: String
  })
  watch(
    () => props.src,
    () => {
      const img = new Image()
      img.src = props.src as string
      img.onload = () => {
        aspectRatio.value = img.width > img.height
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div :class="`w-full h-full relative ${src ? 'bg-black' : ''} overflow-hidden image-box`">
    <img
      :src="src"
      :alt="alt"
      :class="`absolute ${aspectRatio ? 'w-[100%] h-auto' : 'w-auto h-[100%]'} left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125`"
    />
  </div>
</template>
