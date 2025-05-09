<template>
  <div
    class="flex items-center hover:bg-[#4A238E] cursor-pointer relative px-3 rounded-sm"
    @click="toggleExportSidebar"
  >
    <span class="mr-1 h-4 w-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <path
          fill="#fff"
          d="M11 14.59V3a1 1 0 0 1 2 0v11.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 1.4-1.42l3.3 3.3zM3 17a1 1 0 0 1 2 0v3h14v-3a1 1 0 0 1 2 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3z"
        />
      </svg>
    </span>
    <span class="block leading leading-8 text-sm">{{ $t('buttons.export') }}</span>
  </div>
</template>
 
<script setup> 
import { useExportStore } from '@/stores/exportStore';

const exportStore = useExportStore();


const toggleExportSidebar = () => {
  exportStore.showDialog(); 
  
};
</script> 

<style scoped>
/* 样式已包含在class中 */
</style> 