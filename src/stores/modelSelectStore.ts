import { defineStore } from 'pinia'
import {
  CommonModelType,
  ModelListPathParams,
  ModeTabType,
  Model,
  ModelVersion
} from '@/types/model'
import { model_types, base_model_types } from '@/api/model'
import { useToaster } from '@/components/modules/toats'

import { PageState } from '@/types/model'

export const useModelSelectStore = defineStore('modelSelect', {
  state: () => ({
    isLoading: false,
    showDialog: false,
    showCommunityDetail: false,
    currentPath: '/quick-start',
    reloadModelSelectList: false,
    closeModelSelectDialog: false,
    closeModelDetailDialog: false,
    currentTab: 'posts' as ModeTabType,
    showModelDetail: false,
    applyObject: { version: {} as ModelVersion, model: {} as Model },
    reload: 0,
    mine: {
      posts: {
        modelListPathParams: {
          mode: 'my',
          current: 1,
          page_size: 28,
          total: 0
        } as ModelListPathParams,
        models: [],
        modelTypes: [],
        baseModelTypes: [],
        filterState: {
          keyword: '',
          sort: 'Recently',
          model_types: [],
          base_models: [],
          selected_model_types: []
        },
        scrollPosition: 0,
        lastState: {
          currentPage: 1,
          hasMore: true,
          hasPrevious: false,
          loadedPages: [],
          scrollRatio: 0,
          totalItems: 0
        }
      } as PageState,
      forked: {
        modelListPathParams: {
          mode: 'my_fork',
          current: 1,
          page_size: 28,
          total: 0
        } as ModelListPathParams,
        models: [],
        modelTypes: [],
        baseModelTypes: [],
        filterState: {
          keyword: '',
          sort: 'Recently',
          model_types: [],
          base_models: [],
          selected_model_types: []
        },
        scrollPosition: 0,
        lastState: {
          currentPage: 1,
          hasMore: true,
          hasPrevious: false,
          loadedPages: [],
          scrollRatio: 0,
          totalItems: 0
        }
      } as PageState,
      community: {
        modelListPathParams: {
          mode: 'publicity',
          current: 1,
          page_size: 28,
          total: 0
        } as ModelListPathParams,
        models: [],
        modelTypes: [],
        baseModelTypes: [],
        filterState: {
          keyword: '',
          sort: 'Recently',
          model_types: [],
          base_models: [],
          selected_model_types: []
        },
        scrollPosition: 0,
        lastState: {
          currentPage: 1,
          hasMore: true,
          hasPrevious: false,
          loadedPages: [],
          scrollRatio: 0,
          totalItems: 0
        }
      } as PageState
    },
    get posts() {
      return this.mine.posts
    },
    get forked() {
      return this.mine.forked
    },
    get community() {
      return this.mine.community
    },
    TabSource: 'my',
    modelId: 0,
    versionId: 0,
    modelTypes: [] as CommonModelType[],
    baseModelTypes: [] as CommonModelType[],
    filterDataLoaded: false
  }),
  actions: {
    setModelTypes(page: ModeTabType, types: CommonModelType[]) {
      this.mine[page].modelTypes = types
    },

    setBaseModelTypes(page: ModeTabType, types: CommonModelType[]) {
      this.mine[page].baseModelTypes = types
    },

    setSelectedModelTypes(page: ModeTabType, types: string[]) {
      console.log('setSelectedModelTypes', page, types)
      this.mine[page].filterState.model_types = types
    },
    resetPageState(page: ModeTabType) {
      this.mine[page] = {
        modelTypes: [],
        baseModelTypes: [],
        models: [],
        modelListPathParams: {
          mode: page === 'posts' ? 'my' : page === 'forked' ? 'my_fork' : 'publicity',
          current: 1,
          page_size: 50,
          total: 0
        },
        filterState: {
          keyword: '',
          model_types: [],
          base_models: [],
          selected_model_types: [],
          sort: 'Recently'
        },
        scrollPosition: 0
      }
    },

    setApplyObject(version: ModelVersion, model: Model) {
      this.applyObject = { version, model }
    },

    async loadFilterData(modelTypes?: string[], baseModelTypes?: string[]) {
      if (this.filterDataLoaded) return
      try {
        const [modelTypesResponse, baseModelResponse] = await Promise.all([
          model_types(),
          base_model_types()
        ])
        
        if (modelTypesResponse?.data) {
          if (modelTypes && modelTypes.length > 0) {
            const predefinedTypes = ['LoRA', 'Controlnet', 'Checkpoint', 'VAE', 'Upscaler', 'Detection']
            const matchedTypes = modelTypes.map(inputType => {
              const matchedType = predefinedTypes.find(predefinedType => 
              {
                // 特殊处理
                if (inputType.toLowerCase() === 'upscalemodel' && predefinedType.toLowerCase() === 'upscaler') {
                  return true
                }
                return predefinedType.toLowerCase() === inputType.toLowerCase()
              }
              )
              return matchedType || 'Other'
            })
            this.modelTypes = modelTypesResponse.data.filter((type: CommonModelType) =>
              matchedTypes.includes(type.value)
            )
            this.setSelectedModelTypes('posts', matchedTypes)
            this.setSelectedModelTypes('forked', matchedTypes)
            this.setSelectedModelTypes('community', matchedTypes)
          } else {
            this.modelTypes = modelTypesResponse.data
          }
          if (this.modelTypes.length > 0 && this.baseModelTypes.length > 0) {
            this.filterDataLoaded = true
          }
        }

        if (baseModelResponse?.data) {
          if (baseModelTypes && baseModelTypes.length > 0) {
            this.baseModelTypes = baseModelResponse.data.filter((type: CommonModelType) =>
              baseModelTypes.includes(type.value)
            )
          } else {
            this.baseModelTypes = baseModelResponse.data
          }
          if (this.modelTypes.length > 0 && this.baseModelTypes.length > 0) {
            this.filterDataLoaded = true
          }
        }
      } catch (error) {
        useToaster.error(`Failed to fetch model types: ${error}`)
        this.modelTypes = []
        this.baseModelTypes = []
      }
    },

    setAndShowCommunityDetail(modelId: number, versionId: number) {
      this.modelId = modelId
      this.versionId = versionId
      this.showCommunityDetail = true
    }
  }
})
