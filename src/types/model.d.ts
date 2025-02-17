declare global {
  interface Window {
    LiteGraph: any
    LGraphCanvas: any
  }
}

export type ModeType = 'my' | 'my_fork' | 'publicity' | 'official'

export type ModeTabType = 'community' | 'posts' | 'forked' 

export type SortValue = 'Recently' | 'Most Forked' | 'Most Used' | 'Most Downloaded' | 'Most Liked'

export interface Model {
  id: string
  name: string
  type: string
  versions?: ModelVersion[]
  user_id: string
  user_name: string
  counter?:any
}

export interface ModelVersion {
  available: boolean
  version: string
  base_model: string
  bizy_model_id: number
  sign:string
  path:string
  counter:any
  intro:string
  liked:boolean
  forked:boolean
  created_at: string
  file_name: string
  file_size:number
  cover_urls:string
  id:number
  public:boolean
  updated_at:string
}


export interface ModelListPathParams {
  current: number 
  page_size: number 
  mode: string 
  total:number 

}

export interface FilterState {
  keyword: string
  model_types: string[]
  base_models: string[]
  selected_model_types: string[]
  sort:SortValue
}

export interface CommonModelType {
  label: string
  value: string
}

export interface FilterState {
  keyword: string
  model_types: string[]
  base_models: string[]
  sort: SortValue
}


export interface MineState {
  posts: {
    filterState: FilterState
  }
  forked: {
    filterState: FilterState
  }
}

export type PageType = 'mainContent' | 'quickStart' | 'workflows' | 'posts' | 'forked'

export interface PageState {
  modelTypes: CommonModelType[]
  baseModelTypes: CommonModelType[]
  filterState: FilterState
  modelListPathParams: ModelListPathParams
  models: Model[]
  scrollPosition: number
  lastState?: {
    currentPage: number;
    hasMore: boolean;
    hasPrevious: boolean;
    loadedPages: number[];
    scrollRatio: number;
    totalItems: number;
  };
}

