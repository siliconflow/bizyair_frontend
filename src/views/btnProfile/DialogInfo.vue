<template>
  <n-modal 
    v-model:show="statusStore.showInfoDialog" 
    preset="card" 
    style="width: 360px;" 
    :auto-focus="false"
    header-style="display: none"
    content-style="padding: 0 32px 32px 32px;" 
    :bordered="false">

    <div class="info-container">
      <img class="avatar" :src="(statusStore.usersMetadata.avatar || statusStore.userAvatar)" />
      <div class="info" @click="toUploadInfo">
        <p class="user-name">{{ statusStore.usersMetadata.name }}</p>
        <p class="user-title">{{ statusStore.usersMetadata.introduction }}</p>
      </div>
      <span class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 1024 1024">
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
          src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/img/20250310/p3tqfe1o62WUCbFjcOWUk9n2dlCXyCB6.webp" />
        <span>BZ币余额</span>
      </div>
      <div class="balance">
        <span class=num>{{ statusStore.userWallte.total_balance || 0 }}<span>币</span></span>
        <span class="btn">充值</span>
      </div>
      <div class="balance-detail-box">
        <div class="balance-detail">
          <div>
            <span class="balance-detail-title">
              <img class="coin-icon"
                src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/img/20250310/FLrDPYmbuUnXSygQF1iePicnQwbPSWXD.webp" />
              赠送银币
              <!-- gift_today_expired 银币今天是否有过期的 -->
              <span class="icon" @click="statusStore.handlePropertyDialog(true)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#64748B"
                    d="M8 9q-.425 0-.712-.288T7 8t.288-.712T8 7h12q.425 0 .713.288T21 8t-.288.713T20 9zm0 4q-.425 0-.712-.288T7 12t.288-.712T8 11h12q.425 0 .713.288T21 12t-.288.713T20 13zm0 4q-.425 0-.712-.288T7 16t.288-.712T8 15h12q.425 0 .713.288T21 16t-.288.713T20 17zM4 9q-.425 0-.712-.288T3 8t.288-.712T4 7t.713.288T5 8t-.288.713T4 9m0 4q-.425 0-.712-.288T3 12t.288-.712T4 11t.713.288T5 12t-.288.713T4 13m0 4q-.425 0-.712-.288T3 16t.288-.712T4 15t.713.288T5 16t-.288.713T4 17" />
                </svg>
              </span>
            </span>
            <span class="balance-sum">{{ statusStore.userWallte.gift_balance || 0 }}</span>
          </div>
          <div>
            <span class="balance-detail-title">
              <img class="coin-icon"
                src="https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/img/20250310/AdLFMb6DyYnpsJArdSpbPz8P7SzMFw3u.webp" />
              充值金币
            </span>
            <span class="balance-sum">{{ statusStore.userWallte.charge_balance || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="logout">
      <span>退出登录</span>
    </div>
  </n-modal>
</template>
<script setup lang="ts">
import { NModal } from "naive-ui"
import { useStatusStore } from "@/stores/userStatus"

const statusStore = useStatusStore()
const toUploadInfo = () => {
  statusStore.showInfoDialog = false
  statusStore.showUploadInfoDialog = true
}
statusStore.get_smetadata()
statusStore.get_wallet()

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
    width: 36px;
    height: 36px;
    border-radius: 18px;
  }

  .info {
    flex: 1;

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
    }
  }

  .icon {}

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
    }
  }
}

.logout {
  span {
    display: flex;
    height: 40px;
    padding: 8px 24px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    align-self: stretch;
    margin-top: 42px;
    border-radius: 20px;
    border: 1px solid #334155;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s;

    &:hover {
      background-color: #7c3aed;
    }
  }
}
</style>
