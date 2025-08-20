<script setup lang="ts">
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Badge } from '@/components/ui/badge'
  import { useI18n } from 'vue-i18n'

  import { useCommunityStore } from '@/stores/communityStore'
  import type { SortValue, PageType } from '@/types/model'

  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator
  } from '@/components/ui/command'
  import { onMounted, nextTick, watch } from 'vue'

  const { t } = useI18n()
  const store = useCommunityStore()

  const props = defineProps<{
    showSortPopover: boolean
    page: PageType
  }>()

  const emit = defineEmits<{
    (e: 'update:showSortPopover', value: boolean): void
    (e: 'fetchData'): void
    (e: 'filter-data-ready'): void
  }>()

  const handleSortChange = async (value: SortValue) => {
    store[props.page].filterState.sort = value
    store[props.page].modelListPathParams.current = 1
    await nextTick()
    emit('fetchData')
    emit('update:showSortPopover', false)
  }

  const handleModelTypeChange = async (type: string) => {
    const types = [...store[props.page].filterState.selected_model_types]
    const index = types.indexOf(String(type))
    index === -1 ? types.push(String(type)) : types.splice(index, 1)

    store[props.page].filterState.selected_model_types = types

    if (types.length === 0) {
      store[props.page].filterState.model_types = store.modelTypes.map(type => type.value)
    } else {
      store[props.page].filterState.model_types = types
    }

    store[props.page].modelListPathParams.current = 1

    await nextTick()
    emit('fetchData')
    emit('update:showSortPopover', false)
  }

  const handleBaseModelChange = async (model: string) => {
    const models = [...store[props.page].filterState.base_models]
    const modelIndex = models.indexOf(String(model))
    if (modelIndex === -1) {
      models.push(String(model))
    } else {
      models.splice(modelIndex, 1)
    }
    store[props.page].filterState.base_models = models

    await nextTick()
    emit('fetchData')
    emit('update:showSortPopover', false)
  }

  const handleHasDraftChange = async (hasDraft: boolean | undefined) => {
    if (store[props.page].filterState.has_draft === hasDraft) {
      delete store[props.page].filterState.has_draft
    } else {
      store[props.page].filterState.has_draft = hasDraft
    }
    await nextTick()
    emit('fetchData')
    emit('update:showSortPopover', false)
  }

  const getStoreRef = (path: PageType) => {
    return store[path]
  }

  const handleSearch = () => {
    const storeRef = getStoreRef(props.page)
    storeRef.modelListPathParams.current = 1
    emit('fetchData')
    emit('update:showSortPopover', false)
  }

  const initializeState = async () => {
    if (!store[props.page]) {
      store.resetPageState(props.page)
    }

    if (!store[props.page].filterState) {
      store[props.page].filterState = {
        selected_model_types: [],
        selected_base_models: [],
        model_types: [],
        base_models: [],
        keyword: '',
        sort: 'Recently',
        is_user_cleared: false
      }
    }
    if (props.page === 'mainContent') {
      if (store[props.page].filterState.selected_model_types.length === 0) {
        store[props.page].filterState.model_types = store.modelTypes
          .filter(type => type.value !== 'Workflow')
          .map(type => type.value)
      }
    }
    if ((props.page === 'posts' || props.page === 'forked') && store.modelTypes.length > 0) {
      const hasWorkflow = store.modelTypes.some(type => type.value === 'Workflow')
      if (!hasWorkflow) {
        store.modelTypes.push({ label: 'Workflow', value: 'Workflow' })
      }
      if (store[props.page].filterState.selected_model_types.length === 0) {
        store[props.page].filterState.model_types = store.modelTypes
          .filter(type => type.value !== 'Application')
          .map(type => type.value)
      }
    }

    await nextTick()
    emit('filter-data-ready')
  }

  const getSortLabel = (sort: SortValue) => {
    switch (sort) {
      case 'Recently':
        return t('community.filter.sort.options.recently')
      case 'Most Forked':
        return t('community.filter.sort.options.most-forked')
      case 'Most Used':
        return t('community.filter.sort.options.most-used')
      case 'Most Downloaded':
        return t('community.filter.sort.options.downloads')
      case 'Most Liked':
        return t('community.filter.sort.options.most-liked')
      default:
        return t('community.filter.sort.options.recently')
    }
  }

  watch(
    () => props.page,
    async (newVal: string) => {
      if (newVal === 'mainContent') {
        store.modelTypes = store.modelTypes.filter(type => type.value !== 'Workflow')
      }
    },
    { immediate: true }
  )

  onMounted(async () => {
    await initializeState()
  })
</script>

<template>
  <div class="flex space-x-2 mb-4">
    <div class="relative flex-1">
      <Input
        v-model="store[props.page].filterState.keyword"
        v-debounce="handleSearch"
        :placeholder="t('community.filter.type.title')"
        class="h-[44px] border border-[#9CA3AF] w-full bg-[#222] rounded-lg pr-8 pl-8"
        @update:model-value="val => (store[props.page].filterState.keyword = String(val))"
      />
      <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          class="hover:brightness-150 transition-all duration-300"
        >
          <path
            d="M14 14L11.1333 11.1333M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"
            stroke="#F9FAFB"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>

    <Popover
      class="bg-[#353535]"
      :open="showSortPopover"
      @update:open="emit('update:showSortPopover', $event)"
    >
      <PopoverTrigger class="bg-transparent">
        <Button
          variant="default"
          class="h-[44px] px-4 bg-[#222] border border-transparent hover:bg-[#222] hover:border hover:border-[#9CA3AF] cursor-pointer group flex items-center"
        >
          <span class="w-[60px] truncate">{{
            getSortLabel(store[props.page].filterState.sort)
          }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6.66675L8 10.6667L12 6.66675"
              stroke="#F9FAFB"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        class="w-[150px] p-0 bg-[#353535] rounded-lg z-12000"
      >
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem
                value="recently"
                :class="[
                  'px-2 py-1.5 text-[#F9FAFB] cursor-pointer',
                  '[&:hover]:!bg-[#8B5CF6] [&:hover]:!text-[#F9FAFB]',
                  store[props.page].filterState.sort === 'Recently'
                    ? '!bg-[#6D28D9] !text-[#F9FAFB]'
                    : ''
                ]"
                @click="handleSortChange('Recently')"
              >
                {{ t('community.filter.sort.options.recently') }}
              </CommandItem>
              <CommandItem
                value="most-forked"
                :class="[
                  'px-2 py-1.5 text-[#F9FAFB] cursor-pointer',
                  '[&:hover]:!bg-[#8B5CF6] [&:hover]:!text-[#F9FAFB]',
                  store[props.page].filterState.sort === 'Most Forked'
                    ? '!bg-[#6D28D9] !text-[#F9FAFB]'
                    : ''
                ]"
                @click="handleSortChange('Most Forked')"
              >
                {{ t('community.filter.sort.options.most-forked') }}
              </CommandItem>
              <CommandItem
                value="most-used"
                :class="[
                  'px-2 py-1.5 text-[#F9FAFB] cursor-pointer',
                  '[&:hover]:!bg-[#8B5CF6] [&:hover]:!text-[#F9FAFB]',
                  store[props.page].filterState.sort === 'Most Used'
                    ? '!bg-[#6D28D9] !text-[#F9FAFB]'
                    : ''
                ]"
                @click="handleSortChange('Most Used')"
              >
                {{ t('community.filter.sort.options.most-used') }}
              </CommandItem>
              <CommandItem
                v-if="props.page === 'quickStart' || props.page === 'workflows'"
                value="most-used"
                :class="[
                  'px-2 py-1.5 text-[#F9FAFB] cursor-pointer',
                  '[&:hover]:!bg-[#8B5CF6] [&:hover]:!text-[#F9FAFB]',
                  store[props.page].filterState.sort === 'Most Downloaded'
                    ? '!bg-[#6D28D9] !text-[#F9FAFB]'
                    : ''
                ]"
                @click="handleSortChange('Most Downloaded')"
              >
                {{ t('community.filter.sort.options.downloads') }}
              </CommandItem>
              <CommandItem
                value="most-used"
                :class="[
                  'px-2 py-1.5 text-[#F9FAFB] cursor-pointer',
                  '[&:hover]:!bg-[#8B5CF6] [&:hover]:!text-[#F9FAFB]',
                  store[props.page].filterState.sort === 'Most Liked'
                    ? '!bg-[#6D28D9] !text-[#F9FAFB]'
                    : ''
                ]"
                @click="handleSortChange('Most Liked')"
              >
                {{ t('community.filter.sort.options.most-liked') }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger class="bg-transparent">
        <Button
          variant="default"
          class="h-[44px] px-4 bg-[#222] border border-transparent hover:bg-[#222] hover:border hover:border-[#9CA3AF] cursor-pointer flex items-center"
        >
          <svg
            width="16"
            height="14"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.6666 1H1.33325L6.66658 7.30667V11.6667L9.33325 13V7.30667L14.6666 1Z"
              stroke="#F9FAFB"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('community.filter.sort.title') }}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" class="w-[200px] p-0 bg-[#222] rounded-lg z-12000">
        <Command>
          <CommandList>
            <CommandGroup v-if="props.page !== 'quickStart' && props.page !== 'workflows'">
              <div class="p-2">
                <div class="text-sm font-medium text-[#F9FAFB] mb-2">
                  {{ t('community.filter.type.model-types') }}
                </div>
              </div>
              <CommandItem value="model-types" class="p-2">
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="type in store.modelTypes"
                    :key="type.value"
                    variant="secondary"
                    :class="[
                      'cursor-pointer transition-colors duration-200',
                      store[props.page].filterState.selected_model_types.includes(type.value)
                        ? 'bg-[#6D28D9] hover:!bg-[#8B5CF6]'
                        : 'bg-[#4E4E4E] hover:!bg-[#5D5D5D]'
                    ]"
                    @click="handleModelTypeChange(type.value)"
                  >
                    {{ type.label }}
                  </Badge>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator v-if="props.page !== 'quickStart' && props.page !== 'workflows'" />
            <CommandGroup>
              <div class="p-2">
                <div class="text-sm font-medium text-[#F9FAFB] mb-2">
                  {{ t('community.filter.type.base-model') }}
                </div>
              </div>
              <CommandItem value="base-models" class="p-2">
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="model in store.baseModelTypes"
                    :key="model.value"
                    variant="secondary"
                    :class="[
                      'cursor-pointer transition-colors duration-200',
                      store[props.page].filterState.base_models.includes(model.value)
                        ? 'bg-[#6D28D9] hover:!bg-[#8B5CF6]'
                        : 'bg-[#4E4E4E] hover:!bg-[#5D5D5D]'
                    ]"
                    @click="handleBaseModelChange(model.value)"
                  >
                    {{ model.label }}
                  </Badge>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandGroup v-if="props.page === 'workflows' || props.page === 'posts'">
              <div class="p-2">
                <div class="text-sm font-medium text-[#F9FAFB] mb-2">
                  {{ t('community.modelCard.tooltips.cloud') }}
                </div>
              </div>
              <CommandItem value="cloud" class="p-2">
                <div class="flex flex-wrap gap-2">
                  <Badge 
                    :class="[
                      'cursor-pointer transition-colors duration-200',
                      store[props.page].filterState.has_draft === true
                        ? 'bg-[#6D28D9] hover:!bg-[#8B5CF6]'
                        : 'bg-[#4E4E4E] hover:!bg-[#5D5D5D]'
                    ]"
                    @click="handleHasDraftChange(true)" 
                    variant="secondary">
                    {{ t('community.modelCard.tooltips.verified') }}
                  </Badge>
                  <Badge 
                    :class="[
                      'cursor-pointer transition-colors duration-200',
                      store[props.page].filterState.has_draft === false
                        ? 'bg-[#6D28D9] hover:!bg-[#8B5CF6]'
                        : 'bg-[#4E4E4E] hover:!bg-[#5D5D5D]'
                    ]"
                    @click="handleHasDraftChange(false)" 
                    variant="secondary">
                    {{ t('community.modelCard.tooltips.unverified') }}
                  </Badge>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
