<template>
  <btnMenu
    :show_cases="show_cases"
    :button-text="$t('buttons.docs')"
    icon="book-open"
    :is-json="true"
  >
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="#fff" d="M8 13h8v-2H8zm0 3h8v-2H8zm0 3h5v-2H8zm-2 3q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h8l6 6v12q0 .825-.587 1.413T18 22zm7-13V4H6v16h12V9zM6 4v5zv16z"/></svg>
  </btnMenu>
</template>
<script setup lang="ts">
  import btnMenu from '@/components/modules/btnMenu.vue'
  import { onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  // import { useDatasetStore } from '@/stores/datasetStore'
  // const datasetStore = useDatasetStore()

  const { t, locale } = useI18n()

  const show_cases = ref({
  })
  show_cases.value = {
    [t('btnDocs.price')]: 'https://price.bizyair.cn/',
    [t('btnDocs.doc')]: 'https://docs.bizyair.cn/'
  }
  watch(locale, () => {
  show_cases.value = {
    [t('btnDocs.price')]: 'https://price.bizyair.cn/',
    [t('btnDocs.doc')]: 'https://docs.bizyair.cn/'
  }
  })
  onMounted(() => {})
</script>
<style scoped></style>
