import { defineStore } from 'pinia'
import { CommonModelType, Model, ModelListPathParams } from '@/types/model'

import { PageType, PageState } from '@/types/model'

export const useCommunityStore = defineStore('community', {
  state: () => ({
    isLoading: false,
    showDialog: false,
    showCommunityDetail: false,
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
        base_models: [],
        selected_model_types: []
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
        model_types: ['Workflow'],
        base_models: [],
        selected_model_types: []
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
        model_types: ['Workflow'],
        base_models: [],
        selected_model_types: []
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
          selected_model_types: []
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
          selected_model_types: []
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
    setModelTypes(page: PageType, types: CommonModelType[]) {
      if (this[page]) {
        this[page].modelTypes = types
      }
    },

    setBaseModelTypes(page: PageType, types: CommonModelType[]) {
      if (this[page]) {
        this[page].baseModelTypes = types
      }
    },

    resetPageState(page: PageType) {
      if (page === 'posts' || page === 'forked') {
        this.mine[page] = {
          modelTypes: [],
          baseModelTypes: [],
          models: [],
          modelListPathParams: {
            mode: page === 'posts' ? 'my' : 'my_fork',
            current: 1,
            page_size: 5,
            total: 0
          },
          filterState: {
            keyword: '',
            model_types: [],
            base_models: [],
            selected_model_types: [],
            sort: 'Recently'
          }
        }
      } else if (this[page]) {
        this[page] = {
          modelTypes: [],
          baseModelTypes: [],
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
            selected_model_types: [],
            sort: 'Recently'
          }
        }
      }
    }
  }
})