<template>
  <n-modal 
    v-model:show="statusStore.showPropertyDialog" 
    preset="card" 
    style="width: 640px;" 
    title="My Coins"
    content-style="padding: 0 32px 32px 32px;" 
    :mask-closable="false"
    :on-after-leave="closeInfoDialog"
    :auto-focus="false"
    :bordered="false">
    
    <div>
      <n-data-table
        :columns="columns"
        :data="statusStore.userCoinsData.list"
        :pagination="pagination"
        :bordered="false"
      />
    </div>

  </n-modal>
</template>
<script setup lang="ts">
import { NModal } from "naive-ui"
import { useStatusStore } from "@/stores/userStatus"
import { NDataTable } from "naive-ui"


const statusStore = useStatusStore()

const pagination = {
  pageSize: 20
}

const closeInfoDialog = () => {
  statusStore.showUploadInfoDialog = false
  statusStore.showInfoDialog = true
}

const columns = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: 'amount',
    key: 'amount',
  },
  {
    title: 'expired_at',
    key: 'expired_at',
  },
]
</script>
<style scoped lang="less">
.info-container {
  
}
</style>
