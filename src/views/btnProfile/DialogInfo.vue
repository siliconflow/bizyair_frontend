<template>
  <n-modal 
    v-model:show="statusStore.showInfoDialog" 
    preset="card" 
    style="width: 360px;" 
    :auto-focus="false"
    header-style="display: none"
    content-style="padding: 0 32px 24px 32px;" 
    :bordered="false">

    <div class="info-container">
      <img class="avatar" :src="(statusStore.usersMetadata.avatar || statusStore.userAvatar)" />
      <div class="info" @click="toUploadInfo">
        <p class="user-name">{{ statusStore.usersMetadata.name }}</p>
        <p class="user-title">{{ statusStore.usersMetadata.introduction || "这家伙很懒，什么也没留下" }}</p>
        <p class="user-title" @click.stop="copyID" >
          ID: <span>{{ statusStore.usersMetadata.id }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="#64748B" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"/><path d="M4.012 16.737A2 2 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></g></svg>
        </p>
      </div>
      <span class="icon" @click="toUploadInfo">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1024 1024">
          <path fill="#64748B"
            d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1l-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4" />
        </svg>
      </span>
      <span class="close" @click="statusStore.showInfoDialog = false">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#64748B" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"/></svg>
      </span>
    </div>
    <div class="financial">
      <div class="balance-title">
        <img class="coin-icon"
          src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/p3tqfe1o62WUCbFjcOWUk9n2dlCXyCB6.webp" />
        <span>余额</span>
      </div>
      <div class="balance">
        <n-tooltip placement="top-start" trigger="hover">
          <template #trigger>
            <span class=num>{{ statusStore.userWallte.total_balance || 0 }}<span>币</span></span>
          </template>
          {{ statusStore.userWallte.total_balance_amount || 0 }}<span>币</span>
        </n-tooltip>
        <span class="btn" @click="orderStore.showProduct = true">充值</span>
      </div>
      <div class="balance-detail-box">
        <div class="balance-detail">
          <div>
            <span class="balance-detail-title">
              <img class="coin-icon"
                src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/FLrDPYmbuUnXSygQF1iePicnQwbPSWXD.webp" />
              赠送银币
              <!-- gift_today_expired 银币今天是否有过期的 -->
              
            </span>
            <n-tooltip placement="top-start" trigger="hover">
              <template #trigger>
                <span class="balance-sum" @click="toAllCoinList('silver')">{{ statusStore.userWallte.gift_balance || 0 }}</span>
              </template>
              {{ statusStore.userWallte.gift_balance_amount || 0 }}<span>币</span>
            </n-tooltip>
          </div>
          <div>
            <span class="balance-detail-title">
              <img class="coin-icon"
                src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/AdLFMb6DyYnpsJArdSpbPz8P7SzMFw3u.webp" />
              充值金币
            </span>
            <n-tooltip placement="top-start" trigger="hover">
              <template #trigger>
                <span class="balance-sum" @click="toAllCoinList('gold')">{{ statusStore.userWallte.charge_balance || 0 }}</span>
              </template>
              {{ statusStore.userWallte.charge_balance_amount || 0 }}<span>币</span>
            </n-tooltip>
          </div>
        </div>
      </div>
    </div>
    <div class="handles">
      <div class="handles-item" @click="statusStore.showApiKeyDialog = true">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="#CBD5E1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m15.5 7.5l2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4m2-2l-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></g></svg>
        </span>
        <span class="word">切换 API 密钥</span>
      </div>
      <div class="handles-item" @click="toAllCoinList('all')">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="#CBD5E1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></g></svg>
        </span>
        <span class="word">我的钱包</span>
      </div>
      <div class="handles-item" @click="statusStore.showRecordDialog = true">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="#CBD5E1" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
        </span>
        <span class="word">充值记录</span>
      </div>
    </div>
  </n-modal>
</template>
<script setup lang="ts">
import { NModal, NTooltip } from "naive-ui"
import { useStatusStore } from "@/stores/userStatus"
import { useOrderStore } from "@/stores/orderStore"

const statusStore = useStatusStore()
const orderStore = useOrderStore()
const toUploadInfo = () => {
  statusStore.showInfoDialog = false
  statusStore.showUploadInfoDialog = true
}

const copyID = () => {
    statusStore.copyText(`${statusStore.usersMetadata.id}`)
}

const toAllCoinList = (type: 'silver' | 'gold' | 'all') => {
  const coin_type = {
    silver: 1,
    gold: 2
  }
  statusStore.coinsParam.current = 1
  if (type === 'all') {
    delete statusStore.coinsParam.coin_type
  } else {
    statusStore.coinsParam.coin_type = coin_type[type]
  }
  statusStore.coinsParam.expire_days = 365
  statusStore.handlePropertyDialog(true)
}


</script>
<style scoped lang="less">
p,
span {
  margin: 0;
  padding: 0;
}

.info-container {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-right: 16px;
  padding-top: 32px;
  width: 100%;
  box-sizing: border-box;
  position: relative;

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 28px;
  }

  .info {
    flex: 1;
    cursor: pointer;
    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 194px;
    }

    .user-name {
      font-size: 18px;
      font-weight: 600;
      line-height: 24px;
    }

    .user-title {
      font-size: 12px;
      line-height: 22px;
      height: 22px;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 6px;
      span{
        font-size: 10px;
      }
    }
  }

  .icon {
    cursor: pointer;
  }

  .close{
    width: 18px;
    height: 18px;
    padding: 2px;
    position: absolute;
    right: -20px;
    top: 10px;
    transition: all 0.3s;
    cursor: pointer;
    user-select: none;
    border: 1px solid #2c2c32;
    box-sizing: content-box;
    &:hover{
      background-color: #1F2937;
      border: 1px solid #334155;
      border-radius: 2px;
    }
  }
}

.financial {
  display: flex;
  height: 160px;
  padding: 8px 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  align-self: stretch;
  border-radius: 8px;
  margin-top: 16px;
  box-sizing: content-box;
  background: linear-gradient(105deg, #FFF3E2 0.27%, #FCEACF 33.67%, #FFDBA6 67.07%);

  .coin-icon {
    width: 24px;
    height: 24px;
  }

  .balance-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1F2937;
  }

  .balance {
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: #1F2937;
    align-items: center;

    .num {
      flex: 1;
      color: #B45309;
      font-size: 32px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      span {
        font-size: 12px;
      }
    }

    .btn {
      width: 62px;
      height: 32px;
      // padding: 10px;
      padding-top: 4px;
      border-radius: 40px;
      color: #fff;
      text-align: center;
      box-sizing: border-box;
      cursor: pointer;
      background: linear-gradient(270deg, #FF740A 0%, #FFB200 100%);

      &:hover {
        background: linear-gradient(270deg, #FFB200 0%, #FFB200 100%);
      }
    }
  }

  .balance-detail-box {
    background: rgba(41, 41, 41, 0.20);
    box-shadow: 0px 15px 30px 0px rgba(255, 255, 255, 0.20) inset, 0px 0px 15px 0px rgba(255, 255, 255, 0.20);
    backdrop-filter: blur(4px);
    // position: relative;
    // left: -32px;
    // right: -32px;
    margin: 0 -48px;
    width: 100%;
    padding: 8px 48px;
    box-sizing: content-box;
  }

  .balance-detail {
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: #1F2937;

    .balance-detail-title {
      display: flex;
      align-items: center;
      gap: 4px;

      .icon {
        display: flex;
        align-items: center;
        cursor: pointer;
      }
    }

    .balance-sum {
      display: block;
      font-size: 18px;
      color: #B45309;
      text-align: center;
      cursor: pointer;
    }
  }
}
.handles{
  display: flex;
  padding-top: 24px;
  justify-content: space-between;
  .handles-item{
    flex: 1;
    padding: 8px 0;
    cursor: pointer;
    transition: all 0.3s;
    user-select: none;
    &:hover{
      background-color: rgba(124, 58, 237, 0.20);
    }
  }
  .icon{
    display: block;
    width: 16px;
    margin: 0 auto;
  }
  .word{
    display: block;
    width: 100%;
    text-align: center;
  }
}
</style>
