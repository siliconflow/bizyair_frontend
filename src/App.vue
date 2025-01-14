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
          <button @click="aaaaaaaaaaaaaa">aaaaaaaaa</button>
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

  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';
  
  const myDarkTheme = { ...darkTheme }
  myDarkTheme.common.primaryColor = 'rgba(109, 40, 217, 1)'
  myDarkTheme.common.primaryColorSuppl = 'rgba(109, 40, 217, 1)'
  myDarkTheme.common.primaryColorHover = 'rgba(109, 40, 217, .8)'
  myDarkTheme.common.inputColor = '#000'
  myDarkTheme.common.inputColorDisabled = 'rgba(109, 40, 217, .2)'
  myDarkTheme.common.primaryColorPressed = 'rgba(109, 40, 217, .8)'
  myDarkTheme.common.baseColor = '#FFF'

  const statusStore = useStatusStore()
  statusStore.loginRefresh()
  statusStore.sendSocket(res => {
    provide('socket', res)
  })

  
  const zip = new JSZip();

  // 递归函数：依次请求文件并处理
  async function fetchFiles(fileNames: string | any[], index = 0) {
    // 如果已经处理完所有文件，递归结束
    if (index >= fileNames.length) {
      console.log('All files have been processed.')
      // 生成 ZIP 文件
      const content = await zip.generateAsync({ type: 'blob' });

      // 下载 ZIP 文件
      saveAs(content, 'files.zip');
      return
    }

    const fileName = fileNames[index]
    const url = `http://localhost:3000/${fileName}`

    try {
      // 发送 POST 请求获取文件对象
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include' // 如果需要携带凭据
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`)
      }

      // 获取文件的二进制数据（Blob）
      const blob = await response.blob()

      // // 将 Blob 转换为 File 对象
      // const file = new File([blob], fileName, { type: blob.type })
      // console.log(`File ${fileName} object:`, file)

      // // 处理文件对象（这里可以根据需要修改）
      // processFile(file)

      zip.file(fileName, blob);

      // 递归调用，处理下一个文件
      await fetchFiles(fileNames, index + 1)
    } catch (error) {
      console.error(`Error fetching ${fileName}:`, error)
    }
  }

  // function processFile(file: File) {
  //   console.log(file)
    

  // }
  const aaaaaaaaaaaaaa = () => {
    fetch('http://localhost:3000/test', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        fetchFiles(data)
      })
  }
  
</script>
<style scoped>
  .menu {
    display: flex;
    width: 100%;
  }
</style>
