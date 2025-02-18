<script setup lang="ts">
  import vDefaultPic from '@/components/modules/vDefaultPic.vue'
  import vImage from '@/components/modules/vImage.vue'
  import { onMounted, ref } from 'vue'

  defineProps({
    src: {
      type: String,
      default: ''
    }
  })

  const h = ref('0px')
  const container = ref<HTMLElement | null>(null)
  onMounted(() => {
    const cv = container.value
    if (cv) {
      h.value = `${cv.clientWidth * (220 / 160)}px`
    }
  })
</script>
<template>
  <div ref="container" class="image-container" :style="{ height: h }">
    <v-image v-if="src" :src="src" alt="" />
    <vDefaultPic v-else />
  </div>
</template>
<style scoped lang="less">
  .image-container {
    width: 100%;
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
