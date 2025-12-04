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
    :style="{ maxWidth: '680px' }"
    :on-after-leave="closeDialog"
  >
    <template #header>{{ t('apiKeyDialog.title') }}</template>

    <div class="comfy-modal-content-sml">
      <Input
        v-model="apiKey"
        type="password"
        :placeholder="t('apiKeyDialog.placeholder')"
        class="text-white"
        :class="[{ 'border-red-500': hasError }]"
        @input="clearError"
      />
      <p>
        {{ t('apiKeyDialog.login') }}
        <a class="underline" href="###" @click.prevent="openOAuth">{{
          t('apiKeyDialog.clickToLogin')
        }}</a>
        ,
      </p>
      <p>
        {{ t('apiKeyDialog.visitTo') }}
        <a class="underline" href="https://cloud.siliconflow.cn" target="_blank"
          >https://cloud.siliconflow.cn</a
        >
        {{ t('apiKeyDialog.getKey') }}
      </p>
      <p>
        {{ t('apiKeyDialog.agreement') }}
        <a
          class="underline"
          href="https://docs.siliconflow.cn/docs/user-agreement"
          target="_blank"
          >{{ t('apiKeyDialog.userAgreement') }}</a
        >
        {{ t('apiKeyDialog.and') }}
        <a
          class="underline"
          href="https://docs.siliconflow.cn/docs/privacy-policy"
          target="_blank"
          >{{ t('apiKeyDialog.privacyPolicy') }}</a
        >
      </p>
    </div>
    <template #footer>
      <div class="api-dialog-footer">
        <n-button type="primary" @click="toSubmit">{{ t('apiKeyDialog.submit') }}</n-button>
        <n-button variant="outline" @click="toClose">{{ t('apiKeyDialog.close') }}</n-button>
      </div>
    </template>
    <!-- </v-dialog> -->
  </n-modal>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  // import vDialog from '@/components/modules/vDialog.vue'
  import { Input } from '@/components/ui/input'
  // import { Button } from '@/components/ui/button'
  import { set_api_key } from '@/api/user'
  import { useStatusStore } from '@/stores/userStatus'
  import { useToaster } from '@/components/modules/toats/index'
  import { useNotificationStore } from '@/stores/notificationStore'
  import { NModal, NButton } from 'naive-ui'

  const { t } = useI18n()
  const statusStore = useStatusStore()
  const notificationStore = useNotificationStore()

  const apiKey = ref<string>('')
  const hasError = ref<boolean>(false)

  const closeDialog = () => {
    statusStore.handleApiKeyDialog(false)
  }
  const openOAuthPopup = async (setKey: (key: string) => void) => {
    const clientId = 'SFtNABXGEb5rZxogl8p3cM'
    // const clientId = 'SF1RAE3KAmVBGTTHRkAL87'
    const ACCOUNT_ENDPOINT = 'https://account.siliconflow.cn'
    const authUrl = `${ACCOUNT_ENDPOINT}/oauth?client_id=${clientId}`
    const popup = window.open(authUrl, 'oauthPopup', 'width=600,height=600')
    window.addEventListener('message', event => {
      if (event.data.data.length > 0 && event.data.data[0]['secret_key_bizyair'] !== undefined) {
        setKey(event.data.data[0]['secret_key_bizyair'])
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
      useToaster(t('apiKeyDialog.success'))
      statusStore.handleApiKeyDialog(false)
      statusStore.loginRefresh()

      notificationStore.loadUnreadCount()
    } else {
      useToaster.error(`${t('apiKeyDialog.failed')} ${await response.text()}`)
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
  .comfy-modal-content-sml {
    p {
      a {
        color: #f1f1f1;
      }
    }
  }
  .api-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    width: 100%;
  }
</style>
