<template>
  <div 
    class="fixed right-8 bottom-8 z-50 cursor-pointer transition-all duration-300 hover:scale-110"
    @click="$emit('click')"
  >
    <div
      class="w-10 h-10 rounded-full bg-[#7C3AED] bg-opacity-80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        class="text-white"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BackToTop'
})

defineEmits(['click'])
</script>

<style scoped>
.hover\:scale-110:hover {
  transform: scale(1.1);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style> 