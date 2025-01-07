import { defineStore } from 'pinia'
import { CommonModelType, Model, ModelListPathParams, PageType } from '@/types/model'
import { model_types, base_model_types } from '@/api/model'
import { useToaster } from '@/components/modules/toats'

import { PageState } from '@/types/model'

export const useCommunityStore = defineStore('community', {
  state: () => ({
    isLoading: false,
    showDialog: false,
    showCommunityDetail: false,
    currentPath: '/quick-start',
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
      },
      scrollPosition: 0,
      lastState: {
        currentPage: 1,
        hasMore: true,
        hasPrevious: false,
        loadedPages: [],
        scrollRatio: 0
      }
    } as PageState,
    quickStart: {
      modelListPathParams: {
        mode: 'official',
        current: 1,
        page_size: 50,
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
      },
      scrollPosition: 0,
      lastState: {
        currentPage: 1,
        hasMore: true,
        hasPrevious: false,
        loadedPages: [],
        scrollRatio: 0
      }
    } as PageState,
    workflows: {
      modelListPathParams: {
        mode: 'publicity',
        current: 1,
        page_size: 50,
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
      },
      scrollPosition: 0,
      lastState: {
        currentPage: 1,
        hasMore: true,
        hasPrevious: false,
        loadedPages: [],
        scrollRatio: 0
      }
    } as PageState,

    mine: {
      posts: {
        modelListPathParams: {
          mode: 'my',
          current: 1,
          page_size: 50,
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
          scrollRatio: 0
        }
      } as PageState,
      forked: {
        modelListPathParams: {
          mode: 'my_fork',
          current: 1,
          page_size: 50,
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
          scrollRatio: 0
        }
      } as PageState
    },

    get posts() {
      return this.mine.posts
    },
    get forked() {
      return this.mine.forked
    },

    modelTypes: [] as CommonModelType[],
    baseModelTypes: [] as CommonModelType[],
    filterDataLoaded: false
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
      } else if (this[page]) {
        this[page] = {
          modelTypes: [],
          baseModelTypes: [],
          models: [],
          modelListPathParams: {
            mode: 'my',
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
      }
    },

    async loadFilterData() {
      if (this.filterDataLoaded) return

      try {
        const [modelTypesResponse, baseModelResponse] = await Promise.all([
          model_types(),
          base_model_types()
        ])

        if (modelTypesResponse?.data) {
          this.modelTypes = modelTypesResponse.data
        }

        if (baseModelResponse?.data) {
          this.baseModelTypes = baseModelResponse.data
        }

        this.filterDataLoaded = true
      } catch (error) {
        useToaster.error(`Failed to fetch model types: ${error}`)
        this.modelTypes = []
        this.baseModelTypes = []
      }
    },

    savePageState(page: PageType, state: {
      currentPage: number;
      hasMore: boolean;
      hasPrevious: boolean;
      loadedPages: number[];
      scrollRatio: number;
    }) {
      if (this[page]) {
        this[page].lastState = {
          ...state,
          loadedPages: [...state.loadedPages]
        }
      }
    },

    restorePageState(page: PageType) {
      if (this[page] && this[page].lastState) {
        return {
          ...this[page].lastState,
          loadedPages: [...this[page].lastState.loadedPages]
        }
      }
      return null
    }
  }
})
