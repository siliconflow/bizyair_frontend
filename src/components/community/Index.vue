<script setup lang="ts">
  import Sidebar from '@/components/community/Sidebar.vue'
  import MainContent from '@/components/community/MainContent.vue'
  import QuickStartContent from '@/components/community/QuickStartContent.vue'
  import WorkflowsContent from '@/components/community/WorkflowsContent.vue'
  import Mine from '@/components/community/Mine.vue'
  // import ModelDetail from '@/components/community/detail/Index.vue'
  import { useCommunityStore } from '@/stores/communityStore'

  const communityStore = useCommunityStore()
  const PATH_TO_TAB_SOURCE = {
    '/my-models': (mineTabSource: string) => (mineTabSource === 'forked' ? 'my_fork' : 'my'),
    default: () => 'publicity'
  } as const

  const handleMenuClick = (item: { path: string }) => {
    communityStore.currentPath = item.path
    const getTabSource =
      PATH_TO_TAB_SOURCE[item.path as keyof typeof PATH_TO_TAB_SOURCE] || PATH_TO_TAB_SOURCE.default
    communityStore.TabSource = getTabSource(communityStore.mineTabSource)
  }
  communityStore.loadFilterData()
</script>

<template>
  <div class="flex w-full h-full overflow-hidden">
    <div class="w-64 flex-shrink-0">
      <Sidebar :current-path="communityStore.currentPath" @menu-click="handleMenuClick" />
    </div>
    <div class="flex-1 bg-[#353535] h-full">
      <keep-alive>
        <component
          :is="
            communityStore.currentPath === '/models'
              ? MainContent
              : communityStore.currentPath === '/quick-start'
                ? QuickStartContent
                : communityStore.currentPath === '/workflows'
                  ? WorkflowsContent
                  : Mine
          "
        />
      </keep-alive>
      <!-- <ModelDetail v-if="communityStore.showCommunityDetail" /> -->
    </div>
  </div>
</template>
