<template>
  <!-- Tab选项卡 -->
  <div class="tabs">
    <div class="tab-item" :class="{ active: activeTab === 'member' }" @click="switchTab('member')">
      {{ $t('btnProfile.product.memberRecharge') }}
    </div>
    <div class="tab-item" :class="{ active: activeTab === 'coin' }" @click="switchTab('coin')">
      {{ $t('btnProfile.product.coinRecharge') }}
    </div>
  </div>

  <!-- 金币充值商品列表 -->
  <ul class="list" v-if="activeTab === 'coin'">
    <li
      v-for="(item, index) in coinProducts"
      :key="index"
      class="item"
      @click="handleAmount(index, 'coin')"
    >
      <div :class="['item-content', { active: activeIndex === index && activeTab === 'coin' }]">
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
            <path
              d="M510.955102 831.738776c-23.510204 0-45.453061-9.926531-61.64898-27.167347L138.971429 468.114286c-28.734694-31.346939-29.779592-79.412245-1.567347-111.804082l117.55102-135.314286c15.673469-18.285714 38.661224-28.734694 63.216327-28.734694H705.306122c24.032653 0 47.020408 10.44898 62.693878 28.734694l118.073469 135.314286c28.212245 32.391837 27.689796 80.457143-1.567347 111.804082L572.081633 804.571429c-15.673469 17.240816-38.138776 27.167347-61.126531 27.167347z"
              fill="#F2CB51"
            ></path>
            <path
              d="M506.77551 642.612245c-5.22449 0-10.971429-2.089796-15.15102-6.269388l-203.755102-208.979592c-7.836735-8.359184-7.836735-21.420408 0.522449-29.779592 8.359184-7.836735 21.420408-7.836735 29.779592 0.522449l189.12653 193.828572 199.053061-194.351021c8.359184-7.836735 21.420408-7.836735 29.779592 0.522449 7.836735 8.359184 7.836735 21.420408-0.522449 29.779592l-214.204081 208.979592c-4.179592 3.657143-9.404082 5.746939-14.628572 5.746939z"
              fill="#FFF7E1"
            ></path>
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

  <!-- 会员充值商品列表 -->
  <ul class="list member-list" v-if="activeTab === 'member'">
    <n-spin :show="loading" :description="$t('vUpload.loading')">
      <div class="member-cards-wrapper">
        <div class="member-cards-container">
          <!-- 普通用户卡片(不可点击) -->
          <li class="member-card">
            <div class="member-card-content disabled-card">
              <!-- 普通用户标题区域 -->
              <div class="member-header">
                <div class="member-title">
                  <svg
                    class="user-icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                  >
                    <path
                      d="M512 512c123.776 0 224-100.224 224-224S635.776 64 512 64 288 164.224 288 288s100.224 224 224 224z m0-384c88.224 0 160 71.776 160 160s-71.776 160-160 160-160-71.776-160-160 71.776-160 160-160z"
                      fill="#94a3b8"
                    ></path>
                    <path
                      d="M512 544c-211.744 0-384 172.256-384 384 0 17.664 14.336 32 32 32s32-14.336 32-32c0-176.448 143.552-320 320-320s320 143.552 320 320c0 17.664 14.336 32 32 32s32-14.336 32-32c0-211.744-172.256-384-384-384z"
                      fill="#94a3b8"
                    ></path>
                  </svg>
                  <span class="normal-text">{{ $t('btnProfile.product.regularMember') }}</span>
                </div>
                <div class="current-tag">{{ $t('btnProfile.product.freeTag') }}</div>
              </div>

              <!-- 价格区域 -->
              <div class="price-section">
                <div class="price-container">
                  <span class="currency">￥</span>
                  <span class="price">0</span>
                </div>
                <div class="description">{{ $t('btnProfile.product.freeDescription') }}</div>
              </div>

              <!-- 按钮区域 -->
              <div class="buy-button-container">
                <n-button class="using-button" disabled>
                  <div style="margin: auto">
                    {{
                      statusStore.usersMetadata.level === 2
                        ? $t('btnProfile.product.activate')
                        : $t('btnProfile.product.usingNow')
                    }}
                  </div>
                </n-button>
              </div>

              <!-- 普通用户特权列表 -->
              <div class="member-benefits-list">
                <!-- <div class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span class="benefit-text">{{ $t('btnProfile.product.dailyLoginReward') }}</span>
                </div> -->
                <div class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span class="benefit-text">{{ $t('btnProfile.product.regularImageLimit') }}</span>
                </div>
                <div class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span class="benefit-text">{{ $t('btnProfile.product.regularRpdLimit') }}</span>
                </div>
                <div class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span class="benefit-text">{{
                    $t('btnProfile.product.regularImageSizeLimit')
                  }}</span>
                </div>
              </div>
            </div>
          </li>

          <!-- 会员卡 -->
          <li
            v-if="memberProducts.length > 0 && !loading"
            class="member-card"
            @click="handleAmount(0, 'member')"
          >
            <div
              :class="[
                'member-card-content',
                { active: activeIndex === 0 && activeTab === 'member' }
              ]"
            >
              <!-- 会员标题区域 -->
              <div class="member-header">
                <div class="member-title">
                  <svg
                    class="crown-icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                  >
                    <path
                      d="M510.955102 831.738776c-23.510204 0-45.453061-9.926531-61.64898-27.167347L138.971429 468.114286c-28.734694-31.346939-29.779592-79.412245-1.567347-111.804082l117.55102-135.314286c15.673469-18.285714 38.661224-28.734694 63.216327-28.734694H705.306122c24.032653 0 47.020408 10.44898 62.693878 28.734694l118.073469 135.314286c28.212245 32.391837 27.689796 80.457143-1.567347 111.804082L572.081633 804.571429c-15.673469 17.240816-38.138776 27.167347-61.126531 27.167347z"
                      fill="#F2CB51"
                    ></path>
                    <path
                      d="M506.77551 642.612245c-5.22449 0-10.971429-2.089796-15.15102-6.269388l-203.755102-208.979592c-7.836735-8.359184-7.836735-21.420408 0.522449-29.779592 8.359184-7.836735 21.420408-7.836735 29.779592 0.522449l189.12653 193.828572 199.053061-194.351021c8.359184-7.836735 21.420408-7.836735 29.779592 0.522449 7.836735 8.359184 7.836735 21.420408-0.522449 29.779592l-214.204081 208.979592c-4.179592 3.657143-9.404082 5.746939-14.628572 5.746939z"
                      fill="#FFF7E1"
                    ></path>
                  </svg>
                  <span class="vip-text">{{ $t('btnProfile.product.monthlyMember') }}</span>
                </div>
                <div class="limited-tag">{{ $t('btnProfile.product.limitedTimeTag') }}</div>
              </div>

              <!-- 价格区域 -->
              <div class="price-section">
                <div class="price-container">
                  <span class="currency">￥</span>
                  <span class="price">{{ memberProducts[0].price / 100 }}</span>
                  <span class="original-price"
                    >{{ $t('btnProfile.product.originalPrice') }}¥
                    {{ memberProducts[0].original_price / 100 }}</span
                  >
                </div>
                <div class="description">{{ $t('btnProfile.product.proDescription') }}</div>
              </div>

              <!-- 购买按钮 -->
              <div class="buy-button-container">
                <template v-if="statusStore.usersMetadata.level === 2">
                  <div class="progress-bar-container">
                    <div class="progress-bar">
                      <div
                        class="progress"
                        :style="{ width: `${(remainingDays / 30) * 100}%` }"
                      ></div>
                    </div>
                    <div class="days-remaining">
                      {{ $t('btnProfile.userInfo.vipRemaining', { days: remainingDays }) }}
                    </div>
                  </div>
                  <n-button class="renew-button" type="warning" @click.stop="handlePay">
                    <div style="margin: auto">
                      {{ $t('btnProfile.product.renewNow') }}
                    </div>
                  </n-button>
                </template>
                <n-button v-else class="buy-button" type="warning" @click.stop="handlePay">
                  <div style="margin: auto">
                    {{ $t('btnProfile.product.specialSubscribe') }}
                  </div>
                </n-button>
              </div>

              <!-- 会员特权列表 -->
              <div class="member-benefits-list">
                <div class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span class="benefit-text">{{ $t('btnProfile.product.dailyLoginReward') }}</span>
                </div>
                <div class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span class="benefit-text">{{ $t('btnProfile.product.vipImageLimit') }}</span>
                </div>
                <div class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span class="benefit-text">{{ $t('btnProfile.product.vipRpdLimit') }}</span>
                </div>
                <div class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span class="benefit-text">{{ $t('btnProfile.product.vipImageSizeLimit') }}</span>
                </div>
              </div>
            </div>
          </li>
        </div>
      </div>
    </n-spin>
  </ul>

  <div class="footer" v-if="activeTab === 'coin'">
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

  <div class="payment" v-if="activeTab === 'coin'">
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
  import { NCheckbox, NButton, NModal, NResult, NSpin } from 'naive-ui'
  import { useOrderStore } from '@/stores/orderStore'
  import { useStatusStore } from '@/stores/userStatus'
  import { onMounted, onUnmounted, ref, computed } from 'vue'
  import { payProduct } from '@/api/order'
  import wechat from './wechat.vue'
  import purchaseDoc from './DialogPurchaseDoc.vue'
  import { useToaster } from '@/components/modules/toats/index'
  import { useI18n } from 'vue-i18n'

  const { t, locale } = useI18n()
  const orderStore = useOrderStore()
  const statusStore = useStatusStore()

  const activeTab = ref('member')
  const activeIndex = ref(0)
  const checked = ref(false)
  const amount = ref(0)
  const wechatText = ref('')
  const loading = ref(true)

  // 计算剩余天数
  const remainingDays = computed(() => {
    const subExpireAt = (statusStore.usersMetadata as any).sub_expire_at
    if (!subExpireAt?.[2]) return 0

    const expireDate = new Date(subExpireAt[2])
    const today = new Date()
    // 计算两个日期之间的差值（毫秒）
    const diffTime = expireDate.getTime() - today.getTime()
    // 转换为天数并向上取整
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  })

  // 将商品分为金币和会员两类
  const coinProducts = ref<any[]>([])
  const memberProducts = ref<any[]>([])

  // 切换Tab
  const switchTab = (tab: string) => {
    activeTab.value = tab
    activeIndex.value = 0
    if (tab === 'coin' && coinProducts.value.length > 0) {
      amount.value = coinProducts.value[0].price / 100
    } else if (tab === 'member' && memberProducts.value.length > 0) {
      amount.value = memberProducts.value[0].price / 100
    }
  }

  const handleAmount = (index: number, type: string) => {
    activeIndex.value = index
    if (type === 'coin') {
      amount.value = coinProducts.value[index] && coinProducts.value[index].price / 100
    } else {
      amount.value = memberProducts.value[index] && memberProducts.value[index].price / 100
    }
  }

  // // 获取权益名称
  // const getBenefitName = (benefit: any) => {
  //   return benefit.name
  // }

  const handlePay = async () => {
    if (activeTab.value === 'coin' && !checked.value) {
      useToaster.error(t('btnProfile.product.agreementWarning'))
      return
    }
    localStorage.removeItem('expire_at')
    localStorage.removeItem('code_url')

    // 根据当前选中的Tab和索引获取商品ID
    const selectedProduct =
      activeTab.value === 'coin'
        ? coinProducts.value[activeIndex.value]
        : memberProducts.value[activeIndex.value]

    const res = await payProduct(selectedProduct.id, 'wechat')
    orderStore.showWechat = true
    wechatText.value = res.data.code_url
    localStorage.setItem('expire_at', res.data.expire_at)
    localStorage.setItem('code_url', res.data.code_url)
    localStorage.setItem('order_no', res.data.order_no)
    orderStore.countExpire(res.data.expire_at)
    orderStore.intervalTimer(statusStore.loginRefresh)
  }

  onMounted(async () => {
    loading.value = true
    await orderStore.getProducts()
    // 分类商品
    coinProducts.value = orderStore.products.filter((item: any) => item.type === 'coin')
    memberProducts.value = orderStore.subProducts || []
    loading.value = false

    // 初始选择第一个月卡充值项目
    switchTab('member')
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

  .tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(109, 40, 217, 0.3);

    .tab-item {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      &.active {
        color: #7c3aed;

        &:after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #7c3aed;
        }
      }

      &:hover {
        color: #7c3aed;
      }
    }
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

  .member-list {
    display: block;
    width: 100%;
  }

  .member-cards-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .member-cards-container {
    display: flex;
    flex-direction: row;
    // justify-content: space-between;
    justify-content: center;
    gap: 70px;
    width: 90%;
    max-width: 800px;
  }

  .member-card {
    flex: 1;
    max-width: 460px;
    margin-bottom: 20px;

    .member-card-content {
      width: 88%;
      height: 530px;
      background-color: rgba(32, 36, 45, 0.9);
      border: 2px solid rgba(109, 40, 217, 0.5);
      border-radius: 12px;
      padding: 25px 20px;
      padding-bottom: 60px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;

      &:hover {
        border: 2px solid #7c3aed;
        box-shadow: 0 0 20px 0 #7c3aed;
      }

      &.active {
        border-color: #7c3aed;
        box-shadow: 0 0 20px 0 #7c3aed;
      }

      &.disabled-card {
        cursor: default;
        background-color: rgba(32, 36, 45, 0.4);
        border: 2px solid rgba(109, 40, 217, 0.2);

        &:hover {
          border: 2px solid rgba(109, 40, 217, 0.2);
          box-shadow: none;
        }
      }
    }

    .member-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .member-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .vip-text {
          font-size: 24px;
          color: #f2cb51;
          font-weight: bold;
        }

        .normal-text {
          font-size: 24px;
          color: #94a3b8;
          font-weight: bold;
        }
      }

      .limited-tag {
        background-color: #ff6b35;
        color: white;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .current-tag {
        background-color: #64748b;
        color: white;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
      }
    }

    .price-section {
      margin-bottom: 24px;

      .price-container {
        display: flex;
        align-items: baseline;
        margin-bottom: 8px;

        .currency {
          font-size: 20px;
          color: #f2cb51;
        }

        .price {
          font-size: 36px;
          font-weight: bold;
          color: #f2cb51;
        }

        .original-price {
          margin-left: 8px;
          color: #94a3b8;
          text-decoration: line-through;
          font-size: 14px;
        }
      }

      .description {
        font-size: 14px;
        color: #e4e4e7;
        margin-top: 10px;
      }
    }

    .buy-button-container {
      margin-bottom: 24px;

      .buy-button {
        width: 100%;
        height: 48px;
        border-radius: 27px;
        font-size: 16px;
        background-color: #f2cb51;
        color: #333;
        border: none;
        margin: 0 auto;
        display: block;
        text-align: center;
        line-height: 48px;
        margin: auto;
        padding: 0;

        &:hover {
          background-color: #e9bd3a;
        }
      }

      .using-button {
        width: 100%;
        height: 48px;
        border-radius: 27px;
        font-size: 16px;
        background-color: #6240c4;
        color: #ffffff;
        border: none;
        margin: 0 auto;
        display: block;
        cursor: not-allowed;
        text-align: center;
        line-height: 48px;
        padding: 0;
      }
    }

    .member-benefits-list {
      margin-top: 10px;
      flex: 1;

      .benefit-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        line-height: 1.4;

        .check-icon {
          color: #10b981;
          margin-right: 8px;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .x-icon {
          color: #94a3b8;
          margin-right: 8px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .benefit-text {
          color: #e4e4e7;
          flex: 1;
          word-break: break-word;
        }

        &.disabled-benefit .benefit-text {
          color: #64748b;
          text-decoration: line-through;
        }

        &:last-child {
          margin-bottom: 30px;
        }
      }
    }
  }

  .free-text {
    margin-left: 8px;
    color: #94a3b8;
    font-size: 14px;
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
    color: #f2cb51;
  }

  .progress-bar-container {
    width: 100%;
    margin: 5px 0;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: rgba(109, 40, 217, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background-color: #f2cb51;
    border-radius: 4px;
  }

  .days-remaining {
    font-size: 12px;
    text-align: center;
    margin: 5px 0;
    color: #ffdb07;
  }

  .renew-button {
    background-color: #f2cb51;
    border-radius: 8px;
    width: 100%;
    height: 36px;
    color: #fff;
    font-weight: 600;
  }
</style>
