import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExportStore = defineStore('export', () => {
  const showExportDialog = ref(false)

  function showDialog() {
    showExportDialog.value = true
  }

  function hideDialog() {
    showExportDialog.value = false
  }

  return {
    showExportDialog,
    showDialog,
    hideDialog,
  }
}) 