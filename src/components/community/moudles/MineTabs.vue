<script setup lang="ts">
  import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'


  type TabType = 'posts' | 'forked'

  const { modelValue } = defineProps<{
    modelValue: TabType
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: TabType): void
  }>()

  const handleTabChange = (value: string) => {
    emit('update:modelValue', value as TabType)
  }

  const modes = ['posts', 'forked']
  const tabLabels: { [key: string]: string } = {
    posts: 'My Posts',
    forked: 'My Forked'
  }
</script>

<template>
  <Tabs :default-value="modelValue" class="h-full flex flex-col" @change="handleTabChange">
    <TabsList
      class="grid grid-cols-2 h-12 w-[300px] mb-[20px] bg-[#4E4E4E] text-white text-sm shrink-0 border-0"
    >
      <TabsTrigger
        v-for="mode in modes"
        :key="mode"
        :value="mode"
        class="text-base font-medium h-10 px-3 py-2 rounded-lg data-[state=active]:bg-[#F9FAFB] data-[state=active]:text-[#111827] data-[state=inactive]:bg-[#4E4E4E] data-[state=inactive]:text-[#F9FAFB] border-0 shadow-none focus:outline-none focus-visible:outline-none transition-all duration-200"
        @click="handleTabChange(mode)"
      >
        {{ tabLabels[mode] }}
      </TabsTrigger>
    </TabsList>
    <template v-for="mode in modes" :key="mode">
      <TabsContent
        v-if="modelValue === mode"
        :value="mode"
        class="flex-1 flex flex-col mt-0 outline-none"
      >
        <slot :name="mode"></slot>
      </TabsContent>
    </template>
  </Tabs>
</template>

<style scoped>
  :deep(.tabs-trigger) {
    transition: all 0.2s;
  }

  :deep([role='tablist']) {
    gap: 0.5rem;
  }
</style>
