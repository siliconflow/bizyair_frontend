<script setup lang="ts">
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Badge } from '@/components/ui/badge'

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
        model_types: [],
        base_models: [],
        keyword: '',
        sort: 'Recently'
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
    }

    await nextTick()
    emit('filter-data-ready')
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
        placeholder="Filter by name"
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
          class="w-[44px] h-[44px] hover:border-2 hover:border-white cursor-pointer group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M2 10.6667L4.66667 13.3334M4.66667 13.3334L7.33333 10.6667M4.66667 13.3334V2.66675M7.33333 2.66675H14M7.33333 5.33341H12M7.33333 8.00008H10"
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
                Recently
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
                Most Forked
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
                Most Used
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
                Most Downloaded
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
                Most Liked
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
          class="w-[44px] h-[44px] hover:border-2 hover:border-white cursor-pointer"
        >
          <!-- <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            class="mr-2"
          >
            <path
              d="M14.6666 2H1.33325L6.66658 8.30667V12.6667L9.33325 14V8.30667L14.6666 2Z"
              stroke="#F9FAFB"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg> -->

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
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" class="w-[200px] p-0 bg-[#222] rounded-lg z-12000">
        <Command>
          <CommandList>
            <CommandGroup v-if="props.page !== 'quickStart' && props.page !== 'workflows'">
              <div class="p-2">
                <div class="text-sm font-medium text-[#F9FAFB] mb-2">Model Types</div>
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
                <div class="text-sm font-medium text-[#F9FAFB] mb-2">Base Models</div>
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
