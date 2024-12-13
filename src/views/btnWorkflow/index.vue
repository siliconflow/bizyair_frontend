<template>
  <div
    @click="showDialog = true"
    class="flex items-center hover:bg-[#4A238E] cursor-pointer relative px-3"
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.44255 6.33333V9C3.44255 9.35362 3.58302 9.69276 3.83307 9.94281C4.08312 10.1929 4.42226 10.3333 4.77588 10.3333H7.44255M2.10921 1H4.77588C5.51226 1 6.10921 1.59695 6.10921 2.33333V5C6.10921 5.73638 5.51226 6.33333 4.77588 6.33333H2.10921C1.37283 6.33333 0.775879 5.73638 0.775879 5V2.33333C0.775879 1.59695 1.37283 1 2.10921 1ZM8.77588 7.66667H11.4425C12.1789 7.66667 12.7759 8.26362 12.7759 9V11.6667C12.7759 12.403 12.1789 13 11.4425 13H8.77588C8.0395 13 7.44255 12.403 7.44255 11.6667V9C7.44255 8.26362 8.0395 7.66667 8.77588 7.66667Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="block leading h-full leading-8 text-sm">PublishWorkflow</span>
  </div>
  <v-dialog
    v-model:open="showDialog"
    class="px-0 overflow-hidden pb-0 z-9000"
    layoutClass="z-9000"
    contentClass="custom-scrollbar max-h-[80vh] overflow-y-auto w-full rounded-tl-lg rounded-tr-lg custom-shadow"
  >
    
  </v-dialog>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import vDialog from '@/components/modules/vDialog.vue'
  const showDialog = ref(false)
</script>
<style scoped></style>
