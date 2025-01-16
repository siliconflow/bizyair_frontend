import { defineStore } from 'pinia'


export const useDatesetStore = defineStore('dateset', {
  state: () => ({
    showListDialog: false,
    showUploadDialog: false,
    formDetail: {
      inputValue: ''
    },
    rules: {}
  }),
  actions: {
    clearDetail() {
      this.formDetail = {inputValue: ''}
    },
    setListDialog(status: boolean) {
      this.showListDialog = status
    },
    setUploadDialog(status: boolean) {
      this.showUploadDialog = status
    },
  }
})
