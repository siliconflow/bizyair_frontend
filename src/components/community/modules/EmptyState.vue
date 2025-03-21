<template>
  <div
    class="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh-220px] py-20 text-white/60"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-16 w-16 mb-4 opacity-40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1"
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
      />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 10h8M8 14h4" />
    </svg>
    <p class="text-lg font-medium">{{ t('community.emptyState.title') }}</p>
    <p class="text-sm mt-2">{{ t('community.emptyState.subtitle') }}</p>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  defineOptions({
    name: 'EmptyState'
  })

  const { t } = useI18n()
</script>
