<template>
  <div class="condition-container">
    <span>{{ t('btnProfile.rechargeRecord.rechargeStatus') }}</span>
    <n-select
      v-model:value="orderStore.payListParms.status"
      :options="orderOptions"
      class="filter-select"
      @update:value="orderStore.getPayPage"
      :placeholder="t('btnProfile.rechargeRecord.rechargeStatus')"
    >
    </n-select>
  </div>
  <n-data-table
    :columns="columns"
    :data="orderStore.payList.list"
    :bordered="true"
    class="info-container"
  />
  <div class="pagination-container" v-if="pageCount > 1">
    <n-pagination
      v-model:page="orderStore.payListParms.current"
      :page-count="pageCount"
      :page-sizes="[orderStore.payListParms.page_size]"
      @update:page="toPagination"
    />
  </div>
  <n-modal
    v-model:show="orderStore.showWechat"
    preset="card"
    :auto-focus="false"
    :title="t('btnProfile.product.wechatPay')"
    style="width: 288px"
    v-on:before-leave="clearTimer"
    :bordered="false"
  >
    <wechat :text="wechatText" />
    <p class="code-hint">{{ t('btnProfile.product.paymentExpired') }}</p>
    <div class="expire_at_layout" v-if="orderStore.wechatExpireAtStamp <= 0">
      <span class="refresh" @click="toPay(tempOrderNo)">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M5.463 4.433A9.96 9.96 0 0 1 12 2c5.523 0 10 4.477 10 10c0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228zm13.074 15.134A9.96 9.96 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772z"
          />
        </svg>
      </span>
      <p>{{ t('btnProfile.product.paymentExpired') }}</p>
    </div>
  </n-modal>
</template>
<script setup lang="ts">
  import { useOrderStore } from '@/stores/orderStore'
  import { useStatusStore } from '@/stores/userStatus'
  import { NDataTable, NSelect, NPagination, NButton, NModal } from 'naive-ui'
  import { computed, h, onMounted, ref } from 'vue'
  import { getOrdersStatus, delOrder } from '@/api/order'
  import wechat from './wechat.vue'
  import { useConfirm } from '@/components/modules/vConfirm/index'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const orderStore = useOrderStore()
  const statusStore = useStatusStore()

  const tempOrderNo = ref('')
  const wechatText = ref('')
  const pageCount = computed(() => {
    return Math.ceil((orderStore.payList.total || 0) / orderStore.payListParms.page_size)
  })

  const orderOptions = computed(() => [
    {
      value: '',
      label: t('btnProfile.rechargeRecord.all')
    },
    {
      value: 'success',
      label: t('btnProfile.rechargeRecord.success'),
      color: '#16A34A'
    },
    {
      value: 'not_pay',
      label: t('btnProfile.rechargeRecord.pending'),
      color: '#F59E0B'
    },
    {
      value: 'refund',
      label: '转入退款',
      color: '#3B82F6'
    },
    {
      value: 'refund_processing',
      label: '退款处理中',
      color: '#F59E0B'
    },
    {
      value: 'refund_success',
      label: '退款成功',
      color: '#16A34A'
    },
    {
      value: 'refund_closed',
      label: '退款关闭',
      color: '#16A34A'
    },
    {
      value: 'refund_abnormal',
      label: '退款异常',
      color: '#EF4444'
    }
  ])

  const toPay = async ({ order_no, expire_at }: any) => {
    tempOrderNo.value = order_no
    const res = await getOrdersStatus(order_no)
    const isStaleDated = expire_at && new Date(expire_at).getTime() > new Date().getTime()
    if (res && res.data.url && isStaleDated) {
      wechatText.value = res.data.url
      orderStore.showWechat = true
      localStorage.setItem('expire_at', expire_at)
      localStorage.setItem('code_url', res.data.url)
      localStorage.setItem('order_no', order_no)
      orderStore.countExpire(expire_at)
      orderStore.intervalTimer(() => {
        statusStore.loginRefresh()
        orderStore.getPayPage()
      })
    }
  }

  const clearTimer = () => {
    console.log('clearTimer')
    orderStore.iTimer && clearInterval(orderStore.iTimer)
    orderStore.timerStatus && clearInterval(orderStore.timerStatus)
  }

  const columns = computed(() => [
    {
      title: t('btnProfile.rechargeRecord.transactionId'),
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
            row.order_no,
            h('img', {
              class: 'coin-icon',
              style: {
                width: '16px',
                height: '16px',
                marginLeft: '10px',
                cursor: 'pointer'
              },
              onClick: () => {
                statusStore.copyText(row.order_no)
              },
              src: 'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/NtDQhgUld4MMtAbO1H9UUDZEgnATxn7Y.webp'
            })
          ]
        )
      }
    },
    {
      title: t('btnProfile.rechargeRecord.rechargeAmount'),
      key: 'amount'
    },
    {
      title: t('btnProfile.rechargeRecord.rechargeTime'),
      key: 'created_at'
    },
    {
      title: t('btnProfile.rechargeRecord.rechargeMethod'),
      key: 'channel'
    },
    {
      title: t('btnProfile.rechargeRecord.rechargeStatus'),
      key: 'status',
      render(row: any) {
        const option = orderOptions.value.find(option => option.value === row.status)
        return h(
          'span',
          {
            style: {
              color: option ? option['color'] : 'inherit'
            }
          },
          option ? option['label'] : '未知'
        )
      }
    },
    {
      title: '操作',
      key: 'actions',
      render(row: any) {
        if (row.status === 'not_pay') {
          return [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => toPay(row)
              },
              { default: () => t('btnProfile.rechargeRecord.continuePayment') }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                style: 'margin-left: 10px',
                onClick: () => handleCancelPay(row.order_no)
              },
              { default: () => t('btnProfile.rechargeRecord.cancelOrder') }
            )
          ]
        }
        return ''
      }
    }
  ])

  const handleCancelPay = async (order_no: string) => {
    const res = await useConfirm({
      title: '提示',
      content: '确定要取消此订单吗？',
      continueText: '确定',
      cancelText: '取消'
    })
    if (res) {
      const del = await delOrder(order_no)
      if (del && del.data && del.data.success) {
        orderStore.getPayPage()
      }
    }
  }

  const toPagination = (page: number) => {
    orderStore.payListParms.current = page
    orderStore.getPayPage()
  }

  onMounted(() => {
    orderStore.getPayPage()
  })
</script>
<style scoped lang="less">
  .condition-container {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 20px;
    span {
      width: 72px;
    }
    .filter-select {
      width: 180px;
    }
  }
  .info-container {
    min-height: 400px;
  }
  .pagination-container {
    display: flex;
    justify-content: end;
    margin-top: 20px;
  }
  .code-hint {
    text-align: center;
  }
  :deep(.too-old td) {
    color: rgba(255, 0, 0, 0.75) !important;
  }
  .expire_at_layout {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .refresh {
      cursor: pointer;
    }
  }
</style>
