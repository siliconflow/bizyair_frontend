import { defineStore } from 'pinia'
import {
  CommonModelType,
  FilterState,
  Model,
  ModelListPathParams,
  ModelVersion as ModelVersionType
} from '@/types/model'

interface PageState {
  modelTypes: CommonModelType[]
  baseModelTypes: CommonModelType[]
  filterState: FilterState
  mode: 'my' | 'my_fork' | 'publicity'
  modelListPathParams: ModelListPathParams
  models: Model[]
}

interface MineState {
  posts: {
    filterState: FilterState
  }
  forked: {
    filterState: FilterState
  }
}

export const useCommunityStore = defineStore('community', {
  state: () => ({
    isLoading: false,
    showDialog: false,
    reloadModelSelectList: false,
    closeModelSelectDialog: false,
    closeModelDetailDialog: false,
    reload: 0,
    models: [] as Model[],
    mainContent: {
      modelListPathParams: {
        mode: 'workflow',
        current: 1,
        page_size: 24,
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
        is_official: true
      },
      mode: 'publicity'
    } as PageState,
    quickStart: {
      modelListPathParams: {
        mode: 'workflow',
        current: 1,
        page_size: 24,
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
        is_official: true
      },
      mode: 'publicity'
    } as PageState,
    workflows: {
      modelListPathParams: {
        mode: 'workflow',
        current: 1,
        page_size: 24,
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
      },
      mode: 'publicity'
    } as PageState,
    modelListPathParams: {
      mode: 'my',
      current: 1,
      page_size: 5,
      total: 0
    } as ModelListPathParams,
    mine: {
      posts: {
        filterState: {
          keyword: '',
          model_types: [],
          base_models: [],
          sort: 'Recently'
        }
      },
      forked: {
        filterState: {
          keyword: '',
          model_types: [],
          base_models: [],
          sort: 'Recently'
        }
      }
    } as MineState
  }),
  actions: {
    // 设置指定页面的 modelTypes
    setModelTypes(page: 'mainContent' | 'quickStart' | 'workflows', types: CommonModelType[]) {
      if (this[page]) {
        this[page].modelTypes = types
      }
    },

    // 设置指定页面的 baseModelTypes
    setBaseModelTypes(page: 'mainContent' | 'quickStart' | 'workflows', types: CommonModelType[]) {
      if (this[page]) {
        this[page].baseModelTypes = types
      }
    },

    // 重置指定页面的状态
    resetPageState(page: 'mainContent' | 'quickStart' | 'workflows') {
      if (this[page]) {
        this[page] = {
          modelTypes: [],
          baseModelTypes: [],
          mode: 'publicity',
          models: [],
          modelListPathParams: {
            mode: 'my',
            current: 1,
            page_size: 5,
            total: 0
          },
          filterState: {
            keyword: '',
            model_types: [],
            base_models: [],
            sort: 'Recently'
          }
        }
      }
    }
  }
})
