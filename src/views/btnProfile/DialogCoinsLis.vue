<template>
  <div class="info-container">
    <p>{{ t('btnProfile.coinsInfo.title') }}</p>
    <div class="total-amount">
      <div class="total-amount-item">
        <p class="total-amount-title">
          <img
            src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/AdLFMb6DyYnpsJArdSpbPz8P7SzMFw3u.webp"
            alt=""
          />
          {{ t('btnProfile.coinsInfo.goldCoins') }}
        </p>
        <p class="amount gold">{{ statusStore.userWallte.charge_balance || 0 }}</p>
      </div>
      <div class="total-amount-item">
        <p class="total-amount-title">
          <img
            src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/FLrDPYmbuUnXSygQF1iePicnQwbPSWXD.webp"
            alt=""
          />
          {{ t('btnProfile.coinsInfo.silverCoins') }}
        </p>
        <p class="amount">{{ statusStore.userWallte.gift_balance || 0 }}</p>
      </div>
    </div>
    <div class="filter-container">
      <n-tabs
        class="filter-tab"
        type="segment"
        animated
        v-model:value="statusStore.coinsParam.coin_type"
        @update:value="statusStore.get_coins"
      >
        <n-tab name="">{{ t('btnProfile.coinsInfo.allCoins') }}</n-tab>
        <n-tab name="1">
          {{ t('btnProfile.coinsInfo.silverCoins') }}
          <img
            class="coin-icon"
            src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/FLrDPYmbuUnXSygQF1iePicnQwbPSWXD.webp"
          />
        </n-tab>
        <n-tab name="2">
          {{ t('btnProfile.coinsInfo.goldCoins') }}
          <img
            class="coin-icon"
            src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/AdLFMb6DyYnpsJArdSpbPz8P7SzMFw3u.webp"
          />
        </n-tab>
      </n-tabs>
      <n-select
        class="filter-select"
        :options="filterOptions"
        v-model:value="statusStore.coinsParam.expire_days"
        @update:value="statusStore.get_coins"
      >
      </n-select>
    </div>
    <n-data-table
      :columns="columns"
      :data="statusStore.userCoinsData.list"
      :bordered="false"
      :row-class-name="rowClassName"
      class="info-container"
    />
    <div class="pagination-container" v-if="pageCount > 1">
      <n-pagination
        v-model:page="statusStore.coinsParam.current"
        :page-count="pageCount"
        :page-sizes="[20]"
        @update:page="toPagination"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useStatusStore } from '@/stores/userStatus'
  import { NDataTable, NSelect, NPagination, NTabs, NTab } from 'naive-ui'
  import { computed, h, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const statusStore = useStatusStore()

  const pageCount = computed(() => {
    return Math.ceil((statusStore.userCoinsData.total || 0) / statusStore.coinsParam.page_size)
  })

  const rowClassName = (row: any) => {
    const expiredAt = new Date(row.expired_at).getTime()
    if (!isNaN(expiredAt) && Math.ceil((expiredAt - Date.now()) / (1000 * 60 * 60 * 24)) <= 1) {
      return 'too-old'
    }
    return ''
  }

  const columns = computed(() => [
    {
      title: t('btnProfile.coinsInfo.coin'),
      key: 'amount',
      render(row: any) {
        return h(
          'span',
          {
            style: {
              display: 'flex',
              alignItems: 'center'
            }
          },
          [
            row.amount,
            h('img', {
              class: 'coin-icon',
              style: {
                width: '16px',
                height: '16px',
                marginLeft: '10px'
              },
              src:
                row.coin_type !== 1
                  ? 'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/AdLFMb6DyYnpsJArdSpbPz8P7SzMFw3u.webp'
                  : 'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/FLrDPYmbuUnXSygQF1iePicnQwbPSWXD.webp'
            })
          ]
        )
      }
    },
    {
      title: t('btnProfile.coinsInfo.expirationTime'),
      key: 'expired_at',
      width: 120
    }
  ])
  
  const filterOptions = ref([
    { label: '1天内', value: 1 },
    { label: '7天内', value: 7 },
    { label: '15天内', value: 15 },
    { label: '30天内', value: 30 },
    { label: '1年内', value: 365 }
    // { label: "全部", value: 999 },
  ])
  const toPagination = (page: number) => {
    statusStore.coinsParam.current = page
    statusStore.get_coins()
  }
</script>
<style scoped lang="less">
  p {
    margin: 0;
    padding: 0;
  }
  .total-amount {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    gap: 16px;
    .total-amount-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #0f172a;
      box-sizing: border-box;
      padding: 8px 16px;
    }
    .total-amount-title {
      display: flex;
      align-items: center;
      gap: 8px;
      img {
        width: 16px;
        height: 16px;
      }
    }
    .amount {
      font-size: 32px;
      font-weight: 600;
      margin-top: 8px;
      color: #8aa3b7;
      line-height: 38px;
    }
    .gold {
      color: #fa9300;
    }
  }
  .filter-container {
    display: flex;
    margin-top: 16px;
    justify-content: space-between;
    .filter-tab {
      width: 240px;
      .coin-icon {
        width: 16px;
        height: 16px;
        margin-left: 4px;
      }
    }
    .filter-select {
      width: 180px;
    }
  }
  .info-container {
    min-height: 400px;
    margin-top: 16px;
  }
  .pagination-container {
    display: flex;
    justify-content: end;
    margin-top: 20px;
  }
  :deep(.too-old td) {
    color: rgba(255, 0, 0, 0.75) !important;
  }
  ::v-deep(.n-tabs .n-tabs-rail .n-tabs-capsule) {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
