import { defineStore } from 'pinia'

interface DatasetVersion {
  version: string,
  cover_urls: any,
  intro: string,
  annotated : boolean,
  files: any,
}
interface DatasetDetail {
  id?: number
  name: string
  nameError?: 'error' | 'success' | null
  type: string
  versions: DatasetVersion[]
}

export const useDatesetStore = defineStore('dateset', {
  state: () => ({
    showListDialog: false,
    showUploadDialog: false,
    formDetail: {
      name: '',
      type: 'Dataset',
      versions: [
        {
          version: 'v1',
          cover_urls: [],
          intro: '',
          annotated : false,
          files: [],
        }
      ],
    } as DatasetDetail
  }),
  actions: {
    clearDetail() {
      this.formDetail = {
        name: '',
        type: 'Dataset',
        versions: [{
          version: 'v1',
          cover_urls: [],
          intro: '',
          annotated : false,
          files: [],
        }]
      }
    },
    setListDialog(status: boolean) {
      this.showListDialog = status
    },
    setUploadDialog(status: boolean) {
      this.showUploadDialog = status
    },
  }
})
