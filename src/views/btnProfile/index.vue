<template>
  <div @click="statusStore.handleShowInfoDialog(true)" variant="outline" class="profile-container">
    <span class="icon-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24">
        <g
          fill="none"
          stroke="#ddd"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 1 0-16 0m16 0a8 8 0 1 0-16 0" />
        </g>
      </svg>
    </span>
    <span class="profile-text">{{ $t('btnProfile.index.profile') }}</span>
    <dialogInfo />
    <DialogUploadInfo />
    <uploadAvatar />
    <n-modal
      v-model:show="statusStore.showPropertyDialog"
      preset="card"
      style="width: 652px"
      content-style="padding: 0 32px 20px 32px;"
      :mask-closable="false"
      :on-after-leave="closeInfoDialog"
      :auto-focus="false"
      :bordered="false"
    >
      <template #header>
        <div class="coins-lis-title">
          <img
            src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/p3tqfe1o62WUCbFjcOWUk9n2dlCXyCB6.webp"
          />
          <span>{{ $t('btnProfile.coinsList.myBZCoins') }}</span>
        </div>
      </template>
      <DialogCoinsLis />
    </n-modal>
    <n-modal
      v-model:show="statusStore.showRecordDialog"
      preset="card"
      style="width: 960px"
      :title="$t('btnProfile.record.rechargeRecord')"
      content-style="padding: 0 32px 20px 32px;"
      :mask-closable="false"
      :on-after-leave="closeInfoDialog"
      :auto-focus="false"
      :bordered="false"
    >
      <DialogRecord />
    </n-modal>
    <n-modal
      v-model:show="orderStore.showProduct"
      preset="card"
      style="width: 960px"
      :auto-focus="false"
      :title="$t('btnProfile.record.bzCoinRecharge')"
      content-style="padding: 0 32px 24px 32px;"
      :bordered="false"
    >
      <DialogProduct />
    </n-modal>
  </div>
</template>
<script setup lang="ts">
  // import { ref } from 'vue'
  // import { NDrawer, NDrawerContent } from 'naive-ui'
  import dialogInfo from './DialogInfo.vue'
  import DialogUploadInfo from './DialogUploadInfo.vue'
  import uploadAvatar from './uploadAvatar.vue'
  import DialogCoinsLis from './DialogCoinsLis.vue'
  import DialogRecord from './DialogRecord.vue'
  import DialogProduct from './DialogProduct.vue'
  import { useStatusStore } from '@/stores/userStatus'
  import { NModal } from 'naive-ui'
  import { useOrderStore } from '@/stores/orderStore'
  import { useI18n } from 'vue-i18n'

  useI18n()
  const statusStore = useStatusStore()
  const orderStore = useOrderStore()

  const closeInfoDialog = () => {
    statusStore.showUploadInfoDialog = false
    statusStore.showInfoDialog = true
  }
</script>
<style scoped lang="less">
  .profile-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    padding: 0 12px;
    border-radius: 4px;
  }

  .profile-container:hover {
    background-color: #4a238e;
  }

  .icon-container {
    width: 16px;
    height: 16px;
  }

  .coins-lis-title {
    display: flex;
    align-items: center;
    img {
      width: 24px;
      height: 24px;
      margin-right: 10px;
    }
  }
</style>
