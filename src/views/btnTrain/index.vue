<template>
  <btnMenu
    :show_cases="show_cases"
    :button-text="$t('buttons.train')"
    icon="book-open"
    :is-json="true"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="#fff"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M9 6h11M3.8 5.8l.8.8l2-2m-2.8 7.2l.8.8l2-2m-2.8 7.2l.8.8l2-2M9 12h11M9 18h11"
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
