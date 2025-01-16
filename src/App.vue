<template>
  <n-config-provider :theme="myDarkTheme">
    <n-message-provider>
      <n-notification-provider>
        <div class="menu-box">
          <div class="bar">
            <h1>
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQwSURBVHic7ZwxiFxVFIb/KyuskCLFFtNpsUIKiwgWEVKslREiWERIIOAKlhYRUgRstlC0EEQsRBKIjaQWi11IkYiCSBZslBVmIEKEWVBQ2IUtZuGzeG/g+Zz39t1z78zszL0fLAvLeeec+efed887796VMplMJpPJZDKZTCaTSQsX6gAgRiKR2Jc0kPSDpB3n3HfTDrhsAtYZSPpA0tfOueNpBFh2AcfsSrrmnBvEdpyKgJJ0KOlN59xOTKcpCShJx5JejyliagJKxUh8MdZ0fiqGkwXjjKR7wEoMZykKKEkvSboew1GKU3jMwDn3fKiTVEegJK0DG6FOUhZQkl4NdZC6gBdCHcxSwENJr7kWJD0t6avSfl/SM232E669VsbpyrmYH9AE3blygp8e8GPF/qYxn5seOc1/AeyY5wg40+LjHDCs2P8NnDXksgr0ZyngrKbwL865iVMLuCjpgaRe5c+fOef+McS5JWndw37fECMuHb/o2w3XXgQOarZHwJohj/XyWh8ehH7+WY3AX+t/AM5L2lbxaFXlS+fcX4YYX0ha9bzmJ0OcuHT8pi/Vrlnnv/e86ujrNcVqyeGq58gbsxFNCCsdE32uYr8G7DXY3THEPws8MYjXjyqElQ6JHlVsV4D7TXbYRt+nBvEANqMKYaVDov2K7VaL3ceG2C9QlEi+PCJSOyuYDsneL+0utdhY677vDeIdAD6lznTpkPBdYIP/lytVvJ86gOsG8UbUFrS50yHpIe3TbAh4lR8UC8ekVbyNg1MnnuT1LNzEpiGm78LxiNM0basEireH580cv4WjD2z6xvBh3ivRe4YdA5+rOe99Sb+peMLYcc49DMitE/NsqH7j+34WuCpp4wSzFUmUP6cf49Q9ovJ00jHOKvDYM04feGuaUzgYo4BbhjjvG2PBki0ij/EvW3q015HbHeIuTRnzhiHG3RZ/VygK9S4sZCFdZdvg/zzNZctWabPpkcPCPcqNObIkTnP3ZodyccD//rhQzYQxtwy+mxoQT6i0/YHbngLCArWzAH7G8I2X19U5AC7U7CxdmYVpqI4o3n/4+p3UbRkBlyfY/mkQEBakpb9l8LnC5Pe770ywXTOKB/BRFBFCOCHBPTxrvtLnpFX1RoNt1xJmEsGvNYNpSW5E7V7V0V999I2axCvtbwQIOAz79BFoSe4To7/q6Btx8p6aewECzr/h0JKb984nitE37jQPKbZ9tNn3sC8gUQScZjH5LfCuiv5cVy6r2CPzu4o9zH8AzzbYrkm6U/62Erw3JuU90pL00Dn3SoiD1HeoBu+NSV3A4BNLKU/hfMwhkA9jOEl1BO5KejnGGeIUBcyHDQM4VnFmONrB65QEPFTks8JSOgLuqpi2UcWTll/AgaS3VSwY0f9fgjT/vTGxmfnemEwmk8lkMplMJpPJZFLjXzMoB90iULCqAAAAAElFTkSuQmCC" alt="" />
              <span>BizyAir</span>
            </h1>
            <div class="handle">
              <span class="input"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
              <span class="msg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.019 17h-6.04m6.04 0h3.614c1.876 0 1.559-1.86.61-2.804C15.825 10.801 20.68 3 11.999 3s-3.825 7.8-7.243 11.196c-.913.908-1.302 2.804.61 2.804H8.98m6.039 0c0 1.925-.648 4-3.02 4s-3.02-2.075-3.02-4"/></svg></span>
              <span class="set"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9l-1.28 2.22l-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24l-1.3-2.21l.8-.9a3 3 0 0 0 0-4l-.8-.9l1.28-2.2l1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24l1.28 2.22l-.8.9a3 3 0 0 0 0 3.98m-6.77-6a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2"/></svg></span>
            </div>
          </div>
          <div class="menu">
            <btnProfile v-if="statusStore.isLogin" />
            <btnApiKey v-else />
            <btnCommunity />
            <btnPublish />
            <btnTrain />
            <btnNews />
            <apiKeyDialog />
            <!-- <button @click="aaaaaaaaaaaaaa">aaaaaaaaa</button> -->
          </div>
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
  import btnTrain from '@/views/btnTrain/index.vue'
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
<style scoped lang="less">
.menu-box {
  border-radius: 12px;
  .bar{
    background-color: #7C3AED;
    display: flex;
    justify-content: space-between;
    border-radius: 12px 12px 0 0;
    cursor: move;
  }
  h1{
    color: #fff;
    margin: 0;
    padding: 8px;
    display: flex;
    img{
      width: 32px;
      height: 32px;
      margin-right: 8px;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
    }
    span{
      font-size: 18px;
      line-height: 32px;
    }
  }
  .handle{
    display: flex;
    padding: 8px;
    span{
      cursor: pointer;
      display: block;
      width: 32px;
      height: 32px;
      padding: 6px;
      box-sizing: border-box;
      border-radius: 20px;
      margin-left: 8px;
      background-color: rgba(0, 0, 0, .2);
      svg{
        width: 20px;
        height: 20px;
      }
    }
  }
  .menu {
    display: flex;
    width: 100%;
    background-color: rgb(72, 72, 78);
    // height: 40px;
    border-radius: 0 0 12px 12px;
    padding: 4px 12px;
  }
}
</style>
