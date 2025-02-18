import { defineStore } from 'pinia'
import { get_datasets } from '@/api/dataset'

interface DatasetVersion {
  version: string
  cover_urls: any
  intro: string
  annotated: boolean
  files: any
}
interface DatasetDetail {
  id?: number
  name: string
  nameError?: 'error' | 'success' | null
  type: string
  versions: DatasetVersion[]
}

export const useDatasetStore = defineStore('dataset', {
  state: () => ({
    showListDialog: false,
    showUploadDialog: false,
    current: 1,
    pageSize: 20,
    pageCount: 0,
    annotated: '',
    keyword: '',
    tableData: [] as { name: string; id: number; versions: any }[],
    formDetail: {
      name: '',
      type: 'Dataset',
      versions: [
        {
          version: 'v1',
          cover_urls: [],
          intro: '',
          annotated: false,
          files: []
        }
      ]
    } as DatasetDetail
  }),
  actions: {
    async getDatasetList() {
      const res = await get_datasets(
        {
          current: this.current,
          page_size: this.pageSize
        },
        {
          keyword: this.keyword,
          annotated: this.annotated
        }
      )
      this.pageCount =
        res.data.total / this.pageSize <= 1 ? 0 : Math.ceil(res.data.total / this.pageSize)
      this.tableData = res.data.list
    },
    fileterList(annotated: string) {
      this.annotated = annotated
      this.current = 1
      this.getDatasetList()
    },
    clearDetail() {
      this.formDetail = {
        name: '',
        type: 'Dataset',
        versions: [
          {
            version: 'v1',
            cover_urls: [],
            intro: '',
            annotated: false,
            files: []
          }
        ]
      }
    },
    setListDialog(status: boolean) {
      this.showListDialog = status
    },
    setUploadDialog(status: boolean) {
      this.showUploadDialog = status
    }
  }
})
