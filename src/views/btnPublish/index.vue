<template>
  <btnMenu :show_cases="show_cases" buttonText="Publish" icon="book-open" :isJson="true">
    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 32 32">
      <path
        fill="#ddd"
        d="M11 23a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2zm-1-3a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1m1-5a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2zM5 5a3 3 0 0 1 3-3h10.172a3 3 0 0 1 2.12.879l5.83 5.828A3 3 0 0 1 27 10.828V27a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zm3-1a1 1 0 0 0-1 1v22a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V12h-5a3 3 0 0 1-3-3V4zm12 6h4.586L19 4.414V9a1 1 0 0 0 1 1"
      />
    </svg>
  </btnMenu>
  <dialogModel />
  <dialogWorkflow />
</template>
<script setup lang="ts">
  import btnMenu from '@/components/modules/btnMenu.vue'
  import dialogModel from './dialogModel.vue'
  import dialogWorkflow from './dialogWorkflow.vue'
  import { onMounted, ref } from 'vue'
  import { modelStore } from '@/stores/modelStatus'
  const modelStoreObject = modelStore()

  const show_cases = ref({
    Model: () => {
      modelStoreObject.setDialogStatus(true)
    },
    'Workflow': () => {
      modelStoreObject.setDialogStatusWorkflow(true)
    },
  })

  onMounted(() => {
    modelStoreObject.getModelTypes()
  })
</script>
<style scoped></style>
