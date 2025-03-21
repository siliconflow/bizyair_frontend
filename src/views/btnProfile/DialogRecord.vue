<template>
  <div class="condition-container">
    <span>{{ $t('btnProfile.record.orderStatus') }}</span>
    <n-select
      v-model:value="orderStore.payListParms.status"
      :options="orderOptions"
      class="filter-select"
      @update:value="orderStore.getPayPage"
      :placeholder="$t('btnProfile.record.selectOrder')"
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
    :title="$t('btnProfile.record.wechatPay')"
    style="width: 288px"
    v-on:before-leave="clearTimer"
    :bordered="false"
  >
    <wechat :text="wechatText" />
    <p class="code-hint">
      {{
        $t('btnProfile.record.expireQrCode', [
          locale == 'en'
            ? orderStore.wechatExpireAt.replace('分', 'minutes').replace('秒', 'seconds')
            : orderStore.wechatExpireAt
        ])
      }}
    </p>
    <div class="expire_at_layout" v-if="orderStore.wechatExpireAtStamp <= 0">
      <span class="refresh" @click="toPay(tempOrderNo)">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M5.463 4.433A9.96 9.96 0 0 1 12 2c5.523 0 10 4.477 10 10c0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228zm13.074 15.134A9.96 9.96 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772z"
          />
        </svg>
      </span>
      <p>{{ $t('btnProfile.record.qrCodeExpired') }}</p>
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

  const { t, locale } = useI18n()
  const orderStore = useOrderStore()
  const statusStore = useStatusStore()

  const tempOrderNo = ref('')
  const wechatText = ref('')
  const pageCount = computed(() => {
    return Math.ceil((orderStore.payList.total || 0) / orderStore.payListParms.page_size)
  })

  const orderOptions = [
    {
      value: '',
      label: t('btnProfile.record.all')
    },
    {
      value: 'success',
      label: t('btnProfile.record.paySuccess'),
      color: '#16A34A'
    },
    {
      value: 'not_pay',
      label: t('btnProfile.record.notPaid'),
      color: '#F59E0B'
    },
    {
      value: 'refund',
      label: t('btnProfile.record.refund'),
      color: '#3B82F6'
    },
    {
      value: 'refund_processing',
      label: t('btnProfile.record.refundProcessing'),
      color: '#F59E0B'
    },
    {
      value: 'refund_success',
      label: t('btnProfile.record.refundSuccess'),
      color: '#16A34A'
    },
    {
      value: 'refund_closed',
      label: t('btnProfile.record.refundClosed'),
      color: '#16A34A'
    },
    {
      value: 'refund_abnormal',
      label: t('btnProfile.record.refundAbnormal'),
      color: '#EF4444'
    }
  ]

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
    orderStore.iTimer && clearInterval(orderStore.iTimer)
    orderStore.timerStatus && clearInterval(orderStore.timerStatus)
  }

  const columns = [
    {
      title: t('btnProfile.record.orderNumber'),
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
      title: t('btnProfile.record.productName'),
      key: 'product_name'
    },
    {
      title: t('btnProfile.record.transactionTime'),
      key: 'created_at'
    },
    {
      title: t('btnProfile.record.transactionAmount'),
      key: 'expired_at',
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
            h('img', {
              class: 'coin-icon',
              style: {
                width: '16px',
                height: '16px',
                marginRight: '4px'
              },
              src:
                row.platform == 'wechat'
                  ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none'%3E%3Cpath d='m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z'/%3E%3Cpath fill='%2300C800' d='M12 3C6.656 3 2 6.643 2 11.5c0 2.798 1.577 5.223 3.906 6.744c.174.383.143.852.115 1.293c-.01.16-.021.316-.021.463a1 1 0 0 0 1 1c1.25 0 2.071-.411 2.639-.81c.197-.14.357-.272.45-.345q.93.154 1.911.155c5.344 0 10-3.643 10-8.5a7.43 7.43 0 0 0-.96-3.658l-.003.002l-11 7a1 1 0 0 1-1.405-.348l-2-3.5a1 1 0 0 1 1.383-1.353l1.58.947a1 1 0 0 0 .944.046l9.297-4.427C17.974 4.228 15.103 3 12 3'/%3E%3C/g%3E%3C/svg%3E"
                  : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%2300A0E9' d='M24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0ZM24 4.36364C13.1551 4.36364 4.36364 13.1551 4.36364 24C4.36364 34.8449 13.1551 43.6364 24 43.6364C30.7379 43.6364 36.6832 40.2427 40.2199 35.0715C38.7865 34.647 36.4967 33.9121 33.537 32.6689C32.3002 32.1494 30.4531 31.3299 27.9958 30.2104C25.0556 33.1735 20.769 36 16.1742 36C12.9855 35.9844 7.63636 34.3728 7.63636 29.3458C7.63636 24.3188 12.5923 23.1225 15.8076 23.1225C17.7535 23.1225 21.1973 24.1964 26.1389 26.3443L26.2149 26.3741C27.5413 24.7514 28.4513 22.867 28.9459 20.7208L29.0455 20.2571L20.3944 20.2571C19.0841 20.257 17.6773 20.2569 16.1742 20.2568V17.9371L22.032 17.9367V15.0371L13.8306 15.0375V13.2977L22.032 13.2971L22.033 9.81818H26.72L26.7196 13.2971L36.0941 13.2977V15.0375L26.7196 15.0371V17.9367L34.2059 17.9371C34.0959 18.661 33.9722 19.3186 33.8347 19.91L33.7506 20.2568C33.4061 21.5023 32.6313 23.3162 31.4262 25.6986C31.1062 26.3312 30.6437 27.0626 30.0599 27.838C31.904 28.5215 33.771 29.1844 35.6605 29.8275C38.1068 30.6601 40.2216 31.3339 42.005 31.8487C43.0543 29.445 43.6364 26.7905 43.6364 24C43.6364 13.1551 34.8449 4.36364 24 4.36364ZM10.3154 28.5436C10.3154 31.7418 17.0047 33.0159 22.4246 29.6497C23.0347 29.2707 23.6048 28.8664 24.1348 28.4369L24.1166 28.4286L23.69 28.1665C20.308 26.1089 17.6806 24.9932 15.8076 24.8194C14.0892 24.66 10.3154 25.3455 10.3154 28.5436ZM29.0455 20.2568L29.0455 20.2571L31.2536 20.2574L29.0455 20.2568Z'/%3E%3C/svg%3E"
            }),
            row.amount / 100
          ]
        )
      }
    },
    {
      title: t('btnProfile.record.orderStatus'),
      key: 'status',
      render(row: any) {
        const option = orderOptions.find(option => option.value === row.status)
        return h(
          'span',
          {
            style: {
              color: option ? option['color'] : 'inherit'
            }
          },
          option ? option['label'] : t('btnProfile.record.unknown')
        )
      }
    },
    {
      title: t('btnProfile.record.operations'),
      key: '',
      width: 150,
      render(row: any) {
        const option = orderOptions.find(option => option.value === row.status)
        return h(
          'span',
          {
            style: {
              color: option ? option['color'] : 'inherit'
            }
          },
          option && option.value === 'not_pay'
            ? [
                h(
                  NButton,
                  {
                    secondary: true,
                    strong: true,
                    size: 'small',
                    type: 'info',
                    onClick: () => toPay(row)
                  },
                  () => t('btnProfile.record.pay')
                ),
                h(
                  NButton,
                  {
                    style: { marginLeft: '8px' },
                    secondary: true,
                    strong: true,
                    size: 'small',
                    onClick: async () => {
                      const res = await useConfirm({
                        title: t('btnProfile.record.confirmCancel'),
                        continueText: t('btnProfile.record.proceed'),
                        cancelText: t('btnProfile.record.cancel')
                      })
                      if (res) {
                        await delOrder(row.order_no)
                        orderStore.getPayPage()
                        localStorage.removeItem('expire_at')
                        localStorage.removeItem('code_url')
                        localStorage.removeItem('order_no')
                      }
                    }
                  },
                  () => t('btnProfile.record.refundOrder')
                )
              ]
            : ''
        )
      }
    }
  ]

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
      width: 90px;
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
