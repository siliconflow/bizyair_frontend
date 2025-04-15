<template>
  <!-- <p class="title">Bz币充值</p> -->
  <ul class="list">
    <li
      v-for="(item, index) in orderStore.products"
      :key="index"
      class="item"
      @click="handleAmount(index)"
    >
      <div :class="['item-content', { active: activeIndex === index }]">
        <p class="coin">
          <img
            v-if="item.type !== 'user_level_2'"
            src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/BRVnojLT9cfbb3p0zdxKJkBVdB7amSPB.webp"
            alt="coin"
            class="coin-icon"
          />
          <svg 
            v-if="item.type === 'user_level_2'" 
            class="crown-icon" 
            viewBox="0 0 1024 1024" 
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            width="28" 
            height="28"
          >
            <path d="M510.955102 831.738776c-23.510204 0-45.453061-9.926531-61.64898-27.167347L138.971429 468.114286c-28.734694-31.346939-29.779592-79.412245-1.567347-111.804082l117.55102-135.314286c15.673469-18.285714 38.661224-28.734694 63.216327-28.734694H705.306122c24.032653 0 47.020408 10.44898 62.693878 28.734694l118.073469 135.314286c28.212245 32.391837 27.689796 80.457143-1.567347 111.804082L572.081633 804.571429c-15.673469 17.240816-38.138776 27.167347-61.126531 27.167347z" fill="#F2CB51"></path>
            <path d="M506.77551 642.612245c-5.22449 0-10.971429-2.089796-15.15102-6.269388l-203.755102-208.979592c-7.836735-8.359184-7.836735-21.420408 0.522449-29.779592 8.359184-7.836735 21.420408-7.836735 29.779592 0.522449l189.12653 193.828572 199.053061-194.351021c8.359184-7.836735 21.420408-7.836735 29.779592 0.522449 7.836735 8.359184 7.836735 21.420408-0.522449 29.779592l-214.204081 208.979592c-4.179592 3.657143-9.404082 5.746939-14.628572 5.746939z" fill="#FFF7E1"></path>
          </svg>
          <span>
            <template v-if="item.type !== 'user_level_2'">
              {{ item.benefits[0].amount }}
              <span class="coin-unit">{{ $t('btnProfile.product.coin') }}</span>
            </template>
            <template v-else>
              <span class="vip-text">月度会员</span>
            </template>
          </span>
        </p>
        <div class="divider"></div>
        <p class="price">￥{{ item.price / 100 }}</p>
      </div>
    </li>
  </ul>
  <div class="footer">
    <div class="agreement">
      <n-checkbox v-model:checked="checked">{{
        $t('btnProfile.product.confirmAgreement')
      }}</n-checkbox>
      <span class="protocol" @click="orderStore.showPurchaseDoc = true">{{
        $t('btnProfile.product.rechargeAgreement')
      }}</span>
    </div>
    <span class="note">{{ $t('btnProfile.product.coinValidityNote') }}</span>
  </div>
  <div class="payment">
    <div class="payment-content">
      <span class="label">{{ $t('btnProfile.product.actualPayment') }}</span>
      <span class="amount">¥ {{ amount }}</span>
      <n-button class="pay-button" type="primary" @click="handlePay">{{
        $t('btnProfile.product.pay')
      }}</n-button>
    </div>
  </div>
  <n-modal
    v-model:show="orderStore.showWechat"
    preset="card"
    :auto-focus="false"
    :title="$t('btnProfile.product.wechatPay')"
    style="width: 288px"
    :bordered="false"
  >
    <wechat :text="wechatText" />
    <p class="code-hint">
      {{
        $t('btnProfile.product.expireQrCode', [
          locale == 'en'
            ? orderStore.wechatExpireAt.replace('分', 'minutes').replace('秒', 'seconds')
            : orderStore.wechatExpireAt
        ])
      }}
    </p>
    <div class="expire_at_layout" v-if="orderStore.wechatExpireAtStamp <= 0">
      <span class="refresh" @click="handlePay">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M5.463 4.433A9.96 9.96 0 0 1 12 2c5.523 0 10 4.477 10 10c0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228zm13.074 15.134A9.96 9.96 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772z"
          />
        </svg>
      </span>
      <p>{{ $t('btnProfile.product.qrCodeExpired') }}</p>
    </div>
  </n-modal>
  <n-modal v-model:show="orderStore.showPayResult">
    <n-result status="success" :description="$t('btnProfile.product.paySuccess')" />
  </n-modal>
  <n-modal
    v-model:show="orderStore.showPurchaseDoc"
    preset="card"
    :auto-focus="false"
    :title="$t('btnProfile.product.rechargeAgreement')"
    style="width: 988px"
    :bordered="false"
  >
    <purchaseDoc />
  </n-modal>
</template>
<script setup lang="ts">
  import { NCheckbox, NButton, NModal, NResult } from 'naive-ui'
  import { useOrderStore } from '@/stores/orderStore'
  import { useStatusStore } from '@/stores/userStatus'
  import { onMounted, onUnmounted, ref } from 'vue'
  import { payProduct } from '@/api/order'
  import wechat from './wechat.vue'
  import purchaseDoc from './DialogPurchaseDoc.vue'
  import { useToaster } from '@/components/modules/toats/index'
  import { useI18n } from 'vue-i18n'

  const { t, locale } = useI18n()
  const orderStore = useOrderStore()
  const statusStore = useStatusStore()

  const activeIndex = ref(0)
  const checked = ref(false)
  const amount = ref(0)
  const wechatText = ref('')

  const handleAmount = (index: number) => {
    activeIndex.value = index
    amount.value = orderStore.products[index] && orderStore.products[index].price / 100
  }

  const handlePay = async () => {
    if (!checked.value) {
      useToaster.error(t('btnProfile.product.agreementWarning'))
      return
    }
    localStorage.removeItem('expire_at')
    localStorage.removeItem('code_url')
    const res = await payProduct(orderStore.products[activeIndex.value].id, 'wechat')
    orderStore.showWechat = true
    wechatText.value = res.data.code_url
    localStorage.setItem('expire_at', res.data.expire_at)
    localStorage.setItem('code_url', res.data.code_url)
    localStorage.setItem('order_no', res.data.order_no)
    orderStore.countExpire(res.data.expire_at)
    orderStore.intervalTimer(statusStore.loginRefresh)
  }

  onMounted(async () => {
    await orderStore.getProducts()
    handleAmount(0)
    // const expireAt = localStorage.getItem('expire_at');
    // if (expireAt && new Date(expireAt).getTime() > new Date().getTime() && localStorage.getItem('code_url')) {
    //   orderStore.showWechat = true;
    //   wechatText.value = localStorage.getItem('code_url') || '';

    //   orderStore.countExpire(expireAt);
    //   orderStore.intervalTimer(statusStore.loginRefresh);
    // }
  })
  onUnmounted(() => {
    if (orderStore.iTimer) {
      clearInterval(orderStore.iTimer)
    }
    if (orderStore.timerStatus) {
      clearInterval(orderStore.timerStatus)
    }
  })
</script>
<style scoped lang="less">
  ul,
  li,
  p {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .title {
    margin-top: 28px;
    text-align: center;
    font-size: 28px;
    font-weight: bold;
  }
  .list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    margin-top: 16px;
    list-style: none;
  }

  .item {
    width: 25%;
    padding: 8px;
    box-sizing: border-box;

    .item-content {
      width: 100%;
      background-color: rgba(109, 40, 217, 0.1);
      border: 2px solid rgba(109, 40, 217, 0.5);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border: 2px solid #7c3aed;
        box-shadow: 0 0 20px 0 #7c3aed;
      }
    }
    .active {
      border-color: #7c3aed;
      box-shadow: 0 0 20px 0 #7c3aed;
    }

    .coin {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      font-size: 30px;
      margin-top: 4px;

      .coin-icon {
        width: 28px;
        height: 28px;
      }

      .coin-unit {
        font-size: 12px;
        margin-left: 4px;
      }
    }

    .divider {
      width: 150px;
      height: 2px;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
      margin: 0 auto;
    }

    .price {
      color: #d48806;
      font-size: 26px;
      text-align: center;
      padding-bottom: 4px;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    font-size: 14px;

    .agreement {
      display: flex;
      align-items: center;
      gap: 8px;

      .protocol {
        color: #94a3b8;
        cursor: pointer;
      }
    }

    .note {
      font-size: 12px;
    }
  }

  .payment {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
    padding: 16px 24px;
    background-color: rgba(109, 40, 217, 0.1);
    border-radius: 40px;

    .payment-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        font-size: 12px;
      }

      .amount {
        color: #d48806;
        font-size: 32px;
      }

      .pay-button {
        border-radius: 20px;
        padding: 0 32px;
      }
    }
  }
  .code-hint {
    text-align: center;
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
  .crown-icon {
    width: 28px;
    height: 28px;
  }
  
  .vip-text {
    font-size: 24px;
    color: #F2CB51;
  }
</style>
