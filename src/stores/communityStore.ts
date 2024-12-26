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

  modelListPathParams: ModelListPathParams
  models: Model[]
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
        mode: 'publicity',
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
        base_models: []
      }
    } as PageState,
    quickStart: {
      modelListPathParams: {
        mode: 'official',
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
        model_types: ['workflow'],
        base_models: [],
        is_official: true
      }
    } as PageState,
    workflows: {
      modelListPathParams: {
        mode: 'publicity',
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
        base_models: []
      }
    } as PageState,

    mine: {
      posts: {
        modelListPathParams: {
          mode: 'my',
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
        }
      } as PageState,
      forked: {
        modelListPathParams: {
          mode: 'my_fork',
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
        }
      } as PageState
    },

    get posts() {
      return this.mine.posts
    },
    get forked() {
      return this.mine.forked
    }
  }),
  actions: {
    setModelTypes(page: 'mainContent' | 'quickStart' | 'workflows', types: CommonModelType[]) {
      if (this[page]) {
        this[page].modelTypes = types
      }
    },

    setBaseModelTypes(page: 'mainContent' | 'quickStart' | 'workflows', types: CommonModelType[]) {
      if (this[page]) {
        this[page].baseModelTypes = types
      }
    },

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
