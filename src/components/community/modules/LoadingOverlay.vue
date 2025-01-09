<template>
  <div class="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
    <div class="flex flex-col items-center space-y-6">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 rounded-full border-4 border-violet-500/30 animate-ping"></div>
        <div class="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin"></div>
      </div>
      <span class="text-white/90 text-base font-medium">Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LoadingOverlay'
})
</script>

<style scoped>
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 