<template>
  <btnMenu
    :show_cases="show_cases"
    :button-text="$t('buttons.train')"
    icon="book-open"
    :is-json="true"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 32 32">
      <path
        fill="#ddd"
        d="M11 23a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2zm-1-3a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1m1-5a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2zM5 5a3 3 0 0 1 3-3h10.172a3 3 0 0 1 2.12.879l5.83 5.828A3 3 0 0 1 27 10.828V27a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zm3-1a1 1 0 0 0-1 1v22a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V12h-5a3 3 0 0 1-3-3V4zm12 6h4.586L19 4.414V9a1 1 0 0 0 1 1"
      />
    </svg>
  </btnMenu>
  <dialogList />
  <dialogUpload />
</template>
<script setup lang="ts">
  import btnMenu from '@/components/modules/btnMenu.vue'
  import dialogList from './dataset/dialogList.vue'
  import dialogUpload from './dataset/dialogUpload.vue'
  import { onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  // import { useDatasetStore } from '@/stores/datasetStore'
  // const datasetStore = useDatasetStore()

  const { locale } = useI18n()
  const show_cases = ref<Record<string, () => void>>({
    // Datasets: () => {
    //   datasetStore.setListDialog(true)
    // }
    // 'Tasks': () => {
    //   datasetStore.setUploadDialog(true)
    // }
    'Coming soon': () => void 0
  })

  onMounted(() => {
    console.log('locale:', locale.value)
    if (locale.value == 'en') {
      show_cases.value = {
        'Coming soon': () => void 0
      }
    } else {
      show_cases.value = {
        敬请期待: () => void 0
      }
    }
  })
  watch(locale, newVal => {
    console.log('locale:', newVal)
    if (newVal == 'en') {
      show_cases.value = {
        'Coming soon': () => void 0
      }
    } else {
      show_cases.value = {
        敬请期待: () => void 0
      }
    }
  })
</script>
<style scoped></style>
