<template>
  <n-config-provider :theme="myDarkTheme">
    <n-message-provider>
      <n-notification-provider>
        <div class="menu">
          <btnProfile v-if="statusStore.isLogin" />
          <btnApiKey v-else />
          <btnCommunity />
          <btnPublish />
          <btnNews />
          <apiKeyDialog />
        </div>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
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
  import { NConfigProvider, darkTheme, NMessageProvider, NNotificationProvider } from 'naive-ui'

  const myDarkTheme = { ...darkTheme }
  myDarkTheme.common.primaryColor = 'rgba(109, 40, 217, 1)'
  myDarkTheme.common.primaryColorSuppl = 'rgba(109, 40, 217, 1)'
  myDarkTheme.common.primaryColorHover = 'rgba(109, 40, 217, .8)'
  myDarkTheme.common.inputColor = '#000'
  myDarkTheme.common.inputColorDisabled = 'rgba(109, 40, 217, .2)'
  myDarkTheme.common.primaryColorPressed = 'rgba(109, 40, 217, .8)'
  myDarkTheme.common.baseColor = '#FFF'
  console.log(myDarkTheme.common)

  const statusStore = useStatusStore()
  statusStore.loginRefresh()
  statusStore.sendSocket(res => {
    provide('socket', res)
  })
</script>
<style scoped>
.menu{
  display: flex;
  width: 100%;
}
</style>
