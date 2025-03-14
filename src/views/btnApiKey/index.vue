<template>
  <div
    class="hover:bg-[#4A238E] cursor-pointer relative px-3 flex items-center"
    @click="statusStore.handleApiKeyDialog(true)"
  >
    <span class="mr-1 leading h-full leading-8 text-sm">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.99992 10.0001L5.99992 14.0001L3.99992 14.0001C2.34307 14.0001 0.999924 12.657 0.999924 11.0001L0.999924 5.00014C0.999924 3.34328 2.34307 2.00014 3.99992 2.00014L11.9999 2.00014C13.6568 2.00014 14.9999 3.34328 14.9999 5.00014L14.9999 11.0001C14.9999 12.657 13.6568 14.0001 11.9999 14.0001L9.99991 14.0001L9.99992 10.0001L5.99992 10.0001Z"
          fill="#F9FAFB"
        />
        <path
          d="M5.99992 10.0001L5.99992 14.0001L3.99992 14.0001C2.34307 14.0001 0.999924 12.657 0.999924 11.0001L0.999924 5.00014C0.999924 3.34328 2.34307 2.00014 3.99992 2.00014L11.9999 2.00014C13.6568 2.00014 14.9999 3.34328 14.9999 5.00014L14.9999 11.0001C14.9999 12.657 13.6568 14.0001 11.9999 14.0001L9.99991 14.0001L9.99992 10.0001L5.99992 10.0001"
          stroke="#352F44"
          stroke-width="1.5"
        />
        <circle cx="7.99992" cy="6.00014" r="1.5" stroke="#352F44" />
        <path
          d="M5.25 9.75C5.25 8.37 6.4018 7.25 7.82097 7.25H8.17903C9.5982 7.25 10.75 8.37 10.75 9.75V10H5.25V9.75Z"
          stroke="#352F44"
          stroke-width="1.5"
        />
      </svg>
    </span>
    <span class="block leading h-full leading-8 text-sm">{{ t('buttons.apiKey') }}</span>
  </div>
  <apiKeyDialog />
</template>
<script setup lang="ts">
  import apiKeyDialog from './apiKeyDialog.vue'
  import { useStatusStore } from '@/stores/userStatus'
 
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
  
  const statusStore = useStatusStore()
</script>
<style scoped></style>
