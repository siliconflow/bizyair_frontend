<template>
  <!-- <v-dialog
    v-model:open="statusStore.showApiKeyDialog"
    layoutClass="z-9000"
    class="max-w-[680px] z-9000"
    @on-close="statusStore.handleApiKeyDialog(false)"
  > -->
  <n-modal
    v-model:show="statusStore.showApiKeyDialog"
    size="huge"
    :bordered="false"
    :auto-focus="false"
    :close-on-esc="false"
    :mask-closable="false"
    preset="card"
    :style="{maxWidth: '680px'}"
    :on-after-leave="closeDialog">
    <template #header>Set API Key</template>

    
    <div class="comfy-modal-content-sml">
      <Input
        v-model="apiKey"
        type="password"
        placeholder="API Key"
        class="text-white"
        :class="[{ 'border-red-500': hasError }]"
        @input="clearError"
      />
      <p>
        Please
        <a class="underline" href="###" @click.prevent="openOAuth">click to login</a>
        and autofill the key,
      </p>
      <p>
        or visit
        <a class="underline" href="https://cloud.siliconflow.cn" target="_blank"
          >https://cloud.siliconflow.cn</a
        >
        to get your key and input manually.
      </p>
      <p>
        Setting the API Key signifies agreement to the
        <a class="underline" href="https://docs.siliconflow.cn/docs/user-agreement" target="_blank"
          >User Agreement</a
        >
        and
        <a class="underline" href="https://docs.siliconflow.cn/docs/privacy-policy" target="_blank"
          >Privacy Policy.</a
        >
      </p>
    </div>
    <template #footer>
      <div class="api-dialog-footer">
        <n-button @click="toSubmit" type="primary">Submit</n-button>
        <n-button variant="outline" @click="toClose">Close</n-button>
      </div>
    </template>
  <!-- </v-dialog> -->
  </n-modal>
</template>
<script setup lang="ts">
  import { ref } from 'vue'

  // import vDialog from '@/components/modules/vDialog.vue'
  import { Input } from '@/components/ui/input'
  // import { Button } from '@/components/ui/button'
  import { set_api_key } from '@/api/user'
  import { useStatusStore } from '@/stores/userStatus'
  import { useToaster } from '@/components/modules/toats/index'

  import { NModal, NButton } from 'naive-ui'
 
  const statusStore = useStatusStore()

  const apiKey = ref<string>('')
  const hasError = ref<boolean>(false)

  const closeDialog = () => {
    statusStore.handleApiKeyDialog(false)
  }

  const openOAuthPopup = async (setKey: (key: string) => void) => {
    const clientId = 'SFaJLLq0y6CAMoyDm81aMu'
    const ACCOUNT_ENDPOINT = 'https://account.siliconflow.cn'
    const authUrl = `${ACCOUNT_ENDPOINT}/oauth?client_id=${clientId}`
    const popup = window.open(authUrl, 'oauthPopup', 'width=600,height=600')
    window.addEventListener('message', event => {
      if (event.data.length > 0 && event.data[0]['secretKey'] !== undefined) {
        setKey(event.data[0]['secretKey'])
        if (popup) {
          popup.close()
        }
      }
    })
  }
  function clearError() {
    hasError.value = false
  }

  async function toSubmit() {
    if (!apiKey.value) {
      hasError.value = true
      return false
    }
    const response = await set_api_key(`api_key=${encodeURIComponent(apiKey.value)}`)
    if (response.ok) {
      useToaster('API Key set successfully!')
      statusStore.handleApiKeyDialog(false)
      statusStore.loginRefresh()
    } else {
      useToaster.error(`Failed to set API Key: ${await response.text()}`)
    }
  }
  function toClose() {
    statusStore.handleApiKeyDialog(false)
    apiKey.value = ''
    hasError.value = false
  }
  function openOAuth() {
    openOAuthPopup((key: string) => {
      apiKey.value = key
    })
  }
</script>
<style scoped lang="less">
  .underline {
    text-decoration: underline;
  }
  .comfy-modal-content-sml{
    p{
      a{
        color: #F1F1F1;
      }
    }
  }
  .api-dialog-footer{
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    width: 100%;
  }
</style>
