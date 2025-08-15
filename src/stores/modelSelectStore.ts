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

    setSelectedBaseModels(page: ModeTabType, models: string[]) {
      console.log('setSelectedBaseModels', page, models)
      this.mine[page].filterState.base_models = models
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
          // 总是显示所有模型类型
          this.modelTypes = modelTypesResponse.data

          if (modelTypes && modelTypes.length > 0) {
            const predefinedTypes = modelTypesResponse.data.map((e: CommonModelType) => e.value)
            const matchedTypes = modelTypes.map(inputType => {
              const matchedType = predefinedTypes.find((predefinedType: string) => {
                // 特殊处理
                if (
                  inputType.toLowerCase() === 'upscalemodel' &&
                  predefinedType.toLowerCase() === 'upscaler'
                ) {
                  return true
                }
                return inputType.toLowerCase().includes(predefinedType.toLowerCase())
              })
              return matchedType || 'Other'
            })
            // 只设置传入的类型为选中状态
            this.setSelectedModelTypes('posts', matchedTypes)
            this.setSelectedModelTypes('forked', matchedTypes)
            this.setSelectedModelTypes('community', matchedTypes)
          } else {
            // 如果没有传入类型，则清空选中状态
            this.setSelectedModelTypes('posts', [])
            this.setSelectedModelTypes('forked', [])
            this.setSelectedModelTypes('community', [])
          }
          if (this.modelTypes.length > 0 && this.baseModelTypes.length > 0) {
            this.filterDataLoaded = true
          }
        }

        if (baseModelResponse?.data) {
          // 总是显示所有基础模型类型
          this.baseModelTypes = baseModelResponse.data

          if (baseModelTypes && baseModelTypes.length > 0) {
            // 只设置传入的基础模型类型为选中状态
            this.setSelectedBaseModels('posts', baseModelTypes)
            this.setSelectedBaseModels('forked', baseModelTypes)
            this.setSelectedBaseModels('community', baseModelTypes)
          } else {
            // 如果没有传入基础模型类型，则清空选中状态
            this.setSelectedBaseModels('posts', [])
            this.setSelectedBaseModels('forked', [])
            this.setSelectedBaseModels('community', [])
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
