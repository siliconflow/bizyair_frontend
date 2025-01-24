<script setup lang="ts">
import vDefaultPic from '@/components/modules/vDefaultPic.vue'
import vImage from '@/components/modules/vImage.vue'
import { onMounted, ref } from 'vue';

defineProps({
  src: {
    type: String,
    default: ''
  }
})

const h = ref(0)
const container = ref<HTMLElement | null>(null)
onMounted(() => {
  if (container.value) {
    h.value = container.value.clientWidth * (220/160)
  }
})
</script>
<template>
  <div ref="container" class="image-container" :style="{ height: `${h}px` }">
    <v-image v-if="src" :src="src" alt="" />
    <vDefaultPic v-else />
  </div>
</template>
<style scoped lang="less">
.image-container{
  width: 100%;
}
</style>
