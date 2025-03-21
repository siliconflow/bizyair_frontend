<template>
  <n-modal
    v-model:show="statusStore.showUploadInfoDialog"
    preset="card"
    style="width: 420px"
    header-style="display: none"
    content-style="padding: 0 32px 32px 32px;"
    :mask-closable="false"
    :on-after-leave="closeInfoDialog"
    :auto-focus="false"
    :bordered="false"
  >
    <div class="info-container">
      <span class="avatar">
        <span class="avatar-icon" @click="statusStore.showUploadAvatarDialog = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#64748B"
              d="M19 6.5h-1.28l-.32-1a3 3 0 0 0-2.84-2H9.44A3 3 0 0 0 6.6 5.55l-.32 1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3.05m1 11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h2a1 1 0 0 0 1-.68l.54-1.64a1 1 0 0 1 .95-.68h5.12a1 1 0 0 1 .95.68l.54 1.64a1 1 0 0 0 .9.68h2a1 1 0 0 1 1 1Zm-8-9a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2"
            />
          </svg>
        </span>
        <img :src="statusStore.usersMetadata.avatar || statusStore.userAvatar" alt="" />
      </span>
      <n-form
        ref="formRef"
        :model="statusStore.usersMetadata"
        label-placement="left"
        :label-width="locale === 'en' ? '110px' : '80px'"
        :rules="rules"
      >
        <n-form-item :label="$t('btnProfile.uploadInfo.nickname')" path="name">
          <n-input
            v-model:value="statusStore.usersMetadata.name"
            placeholder="name"
            maxlength="50"
          />
        </n-form-item>
        <n-form-item :label="$t('btnProfile.uploadInfo.signature')" path="introduction">
          <n-input
            v-model:value="statusStore.usersMetadata.introduction"
            type="textarea"
            placeholder="introduction"
            maxlength="50"
          />
        </n-form-item>
        <n-form-item :label="$t('btnProfile.uploadInfo.realNameAuth')" path="introduction">
          <span v-if="statusStore.usersMetadata.auth == 1" class="auth-status">
            {{ $t('btnProfile.uploadInfo.authenticated') }}
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 512 512"
              class="text-green-400 ml-1"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm106.5 150.5L228.8 332.8h-.1c-1.7 1.7-6.3 5.5-11.6 5.5-3.8 0-8.1-2.1-11.7-5.7l-56-56c-1.6-1.6-1.6-4.1 0-5.7l17.8-17.8c.8-.8 1.8-1.2 2.8-1.2 1 0 2 .4 2.8 1.2l44.4 44.4 122-122.9c.8-.8 1.8-1.2 2.8-1.2 1.1 0 2.1.4 2.8 1.2l17.5 18.1c1.8 1.7 1.8 4.2.2 5.8z"
              ></path>
            </svg>
          </span>
          <n-button v-else tertiary @click="toRealName">{{ $t('btnProfile.uploadInfo.authenticate') }}</n-button>
        </n-form-item>
      </n-form>
    </div>
    <div class="sunbmit-container">
      <span class="btn" @click="cancel">{{ $t('btnProfile.uploadInfo.cancel') }}</span>
      <span class="btn btn-submit" @click="toSubmit">{{ $t('btnProfile.uploadInfo.confirm') }}</span>
    </div>
  </n-modal>
</template>
<script setup lang="ts">
  import { NModal, NButton } from 'naive-ui'
  import { useStatusStore } from '@/stores/userStatus'
  import { NForm, NFormItem, NInput } from 'naive-ui'
  import { put_metadata, post_real_name } from '@/api/user'
  import { ref } from 'vue'
  import { useConfirm } from '@/components/modules/vConfirm'
  import { useI18n } from 'vue-i18n'

  const { t, locale } = useI18n()
  const statusStore = useStatusStore()
  const formRef = ref()

  const rules = {
    name: [{ required: true, message: t('btnProfile.uploadInfo.nameValidation'), trigger: 'blur', max: 50 }]
  }
  const closeInfoDialog = () => {
    statusStore.showUploadInfoDialog = false
    statusStore.showInfoDialog = true
  }
  const toRealName = async () => {
    const res = await post_real_name()
    console.log(res.data.auth == 1)
    if (res && res.data && res.data.auth == 1) {
      statusStore.usersMetadata.auth = 1
    } else {
      const res = await useConfirm({
        title: t('btnProfile.uploadInfo.authFailed'),
        content: t('btnProfile.uploadInfo.needAuthOnSiliconflow'),
        continueText: t('btnProfile.uploadInfo.goTo'),
        cancelText: t('btnProfile.uploadInfo.cancel')
      })

      if (res) {
        window.open('https://cloud.siliconflow.cn/account/authentication', '_blank')
        await handleSecondConfirmation()
      }
    }
  }

  const handleSecondConfirmation = async () => {
    const resSecond = await useConfirm({
      content: t('btnProfile.uploadInfo.completed'),
      continueText: t('btnProfile.uploadInfo.completed'),
      cancelText: t('btnProfile.uploadInfo.retry')
    })

    if (resSecond) {
      toRealName()
    } else {
      window.open('https://cloud.siliconflow.cn/account/authentication', '_blank')
      await handleSecondConfirmation()
    }
  }
  const toSubmit = () => {
    formRef.value?.validate(async (errors: any) => {
      if (!errors) {
        const temp = { ...statusStore.usersMetadata }
        await put_metadata(temp)
        statusStore.showUploadInfoDialog = false
        statusStore.showInfoDialog = true
      } else {
        console.log(errors)
      }
    })
  }
  const cancel = async () => {
    await statusStore.get_metadata()
    statusStore.showUploadInfoDialog = false
  }
</script>
<style scoped lang="less">
  .info-container {
    .avatar {
      width: 80px;
      display: block;
      border-radius: 50%;
      margin: 48px auto 24px;
      position: relative;
      overflow: hidden;
      .avatar-icon {
        position: absolute;
        left: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        width: 80px;
        height: 80px;
        overflow: auto;
        line-height: 80px;
        text-align: center;
        opacity: 0;
        transition: all 0.3s;
        cursor: pointer;
        svg {
          fill: #fff;
          stroke: #fff;
        }
      }
      img {
        width: 80px;
        height: 80px;
        display: block;
      }
      &:hover {
        .avatar-icon {
          opacity: 1;
        }
      }
    }
    .auth-status {
      display: flex;
      align-items: center;
      font-size: 12px;
    }
  }
  .sunbmit-container {
    display: flex;
    gap: 8px;
    justify-content: space-between;
    .btn {
      flex: 1;
      padding: 8px 0;
      text-align: center;
      cursor: pointer;
      border: 1px solid #334155;
      user-select: none;
      border-radius: 20px;
      transition: all 0.3s;
      &:hover {
        background-color: #7c3aed;
      }
    }
    .btn-submit {
      background-color: #7c3aed;
      &:hover {
        opacity: 0.8;
      }
    }
  }
</style>
