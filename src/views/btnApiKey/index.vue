<template>
  <div
    @click="statusStore.handleApiKeyDialog(true)"
    class="flex items-center hover:bg-[#4A238E] cursor-pointer relative px-3 rounded-sm"
  >
    <span class="mr-1 h-4 w-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <g
          fill="none"
          stroke="#fff"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="m15.5 7.5l2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4m2-2l-9.6 9.6" />
          <circle cx="7.5" cy="15.5" r="5.5" />
        </g>
      </svg>
    </span>
    <span class="block leading leading-8 text-sm">{{ t('buttons.apiKey') }}</span>
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
