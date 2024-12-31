<template>
  <div class="shadcn-root flex w-full">
    <btnProfile v-if="statusStore.isLogin" />
    <btnApiKey v-else />
    <btnCommunity />
    <btnPublish />
    <btnNews />
    <apiKeyDialog />
  </div>
</template>
<script setup lang="ts">
  import btnApiKey from '@/views/btnApiKey/index.vue'
  import btnProfile from '@/views/btnProfile/index.vue'
  import btnCommunity from '@/views/btnCommunity/index.vue'
  import btnPublish from '@/views/btnPublish/index.vue'
  import btnNews from '@/views/btnNews/index.vue'
  import apiKeyDialog from '@/views/btnApiKey/apiKeyDialog.vue'
  import { useStatusStore } from '@/stores/userStatus'
  import { provide } from 'vue'

  const statusStore = useStatusStore()
  statusStore.loginRefresh()
  statusStore.sendSocket(res => {
    provide('socket', res)
  })
</script>
<style scoped></style>
