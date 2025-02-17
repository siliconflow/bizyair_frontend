import {
  CommonModelType,
  FilterState,
  Model,
  ModelListPathParams,
  ModelVersion as ModelVersionType
} from '@/types/model'
import { model_types, base_model_types } from '@/api/model'
import { defineStore } from 'pinia'
interface ModelVersion {
  id?: number
  version: string
  versionError?: boolean
  base_model: any
  baseModelError?: boolean
  intro: string
  sign: string
  path: string
  filePath: string
  filePathError?: boolean
  public: boolean
  progress?: number
  file_upload_id?: string
  file_name?: string
  showUpload?: boolean
  speed?: string
  fileName?: string
  ref?: string
  cover_urls?: string[]
  hideUpload?: boolean
  imageDone?: boolean
  imageError?: boolean
}
interface ModelDetail {
  name: string
  nameError?: boolean
  type: string
  typeError?: boolean
  id?: number
  versions: ModelVersion[]
}
type ShowVersionId = number | undefined
export const modelStore = defineStore('modelStore', {
  state: () => ({
    isLoading: false,
    modelDetail: {
      name: '',
      type: '',
      versions: []
    } as ModelDetail,
    showDialog: false,
    reloadModelSelectList: false,
    closeModelSelectDialog: false,
    closeModelDetailDialog: false,
    showVersionId: 0 as ShowVersionId,
    showWorkflowDialog: false,
    showWorkflowVersionId: 0 as ShowVersionId,
    mode: 'my' as 'my' | 'my_fork' | 'publicity',
    applyObject: { version: {} as ModelVersionType, model: {} as Model },
    reload: 0,
    modelTypes: [] as CommonModelType[],
    baseModelTypes: [] as CommonModelType[],
    selectedModelTypes: [] as string[],
    selectedBaseModels: [] as string[],
    models: [] as Model[],
    modelListPathParams: {
      mode: 'my',
      current: 1,
      page_size: 5,
      total: 0
    } as ModelListPathParams,
    filterState: {
      keyword: '',
      model_types: [],
      base_models: [],
      selected_model_types: [],
      sort: 'Recently'
    } as FilterState,
    typeLis: [{ value: '', label: '' }],
    baseTypeLis: [{ value: '', label: '' }]
  }),
  actions: {
    setModelDetail(data: any) {
      this.modelDetail = data
      if (this.modelDetail.id) {
        this.modelDetail.versions.forEach((item: ModelVersion) => {
          item.filePath = item.file_name as string
        })
      }
    },
    clearModelDetail() {
      this.modelDetail = {
        name: '',
        type: '',
        versions: []
      }
    },
    setDialogStatus(status: boolean, versionId?: number) {
      this.showDialog = status
      this.showVersionId = versionId
    },
    setDialogStatusWorkflow(status: boolean, versionId?: number) {
      this.showWorkflowDialog = status
      this.showVersionId = versionId
    },
    uploadModelDone() {
      this.reload += 1
    },
    closeAndReload() {
      this.closeModelDetailDialog = true
      this.reloadModelSelectList = true
    },
    setApplyObject(version: ModelVersionType, model: Model) {
      this.closeModelSelectDialog = true
      this.closeModelDetailDialog = true
      this.applyObject = { version, model }
    },
    setModelTypes(types: CommonModelType[]) {
      this.modelTypes = types
    },
    setSelectedBaseModels(models: string[]) {
      this.selectedBaseModels = models
    },
    setSelectedModelTypes(types: string[]) {
      this.selectedModelTypes = types
    },
    setBaseModelTypes(types: CommonModelType[]) {
      this.baseModelTypes = types
    },
    setModelListPathParams(params: ModelListPathParams) {
      this.modelListPathParams = params
    },
    setFilterState(state: FilterState) {
      this.filterState = state
    },
    setIsLoading(status: boolean) {
      this.isLoading = status
    },
    resetModelListPathParams() {
      this.mode = 'my'
      this.modelListPathParams = {
        mode: 'my',
        current: 1,
        page_size: 5,
        total: 0
      }
      this.filterState = {
        keyword: '',
        model_types: [],
        base_models: [],
        selected_model_types: [],
        sort: 'Recently'
      }
    },
    updatePagination(page: number) {
      this.modelListPathParams.current = page
    },
    async getModelTypes() {
      const mt = await model_types()
      const bmt = await base_model_types()
      this.typeLis = mt.data
      this.baseTypeLis = bmt.data
    }
  }
})
