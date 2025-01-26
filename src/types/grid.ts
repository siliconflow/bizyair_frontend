import type { Ref, ComputedRef } from 'vue'
import type { Model, ModelListPathParams, FilterState, PageType } from './model'

export interface GridState {
  loading: Ref<boolean>
  isGridLoading: Ref<boolean>
  cacheKey: Ref<number>
  hasMore: Ref<boolean>
  showSortPopover: Ref<boolean>
  imageLoadStates: Ref<Map<number | string, boolean>>
}

export interface UseModelGridOptions {
  pageKey: PageType | Ref<PageType>
  initialState?: Partial<GridState>
}

export interface UseModelGridReturn {
  state: GridState
  storeState: ComputedRef<{
    models: Model[]
    modelListPathParams: ModelListPathParams
    filterState: FilterState
  }>
  fetchData: () => Promise<unknown[]>
  loadMore: () => Promise<void>
  doMetaFetch: () => Promise<void>
  handleImageLoad: (_event: Event, modelId: number | string) => void
  handleImageError: (_event: Event, modelId: number | string) => void
}
