<script setup lang="ts">
  import { ref } from 'vue'
  import Sidebar from '@/components/community/Sidebar.vue'
  import MainContent from '@/components/community/MainContent.vue'
  import QuickStartContent from '@/components/community/QuickStartContent.vue'
  import WorkflowsContent from '@/components/community/WorkflowsContent.vue'
  import Mine from '@/components/community/Mine.vue'

  const currentPath = ref('/models')

  const handleMenuClick = (item: { path: string }) => {
    currentPath.value = item.path
  }
</script>

<template>
  <div class="flex w-full h-screen overflow-hidden">
    <div class="w-64 flex-shrink-0">
      <Sidebar :current-path="currentPath" @menu-click="handleMenuClick" />
    </div>
    <div class="flex-1 bg-[#353535] h-full">
      <keep-alive>
        <component
          :is="
            currentPath === '/models'
              ? MainContent
              : currentPath === '/quick-start'
                ? QuickStartContent
                : currentPath === '/workflows'
                  ? WorkflowsContent
                  : Mine
          "
        />
      </keep-alive>
    </div>
  </div>
</template>
