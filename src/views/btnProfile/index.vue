<template>
  <div @click="toshowDrawer" variant="outline" class="profile-container">
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
    <span class="profile-text">Profile</span>
  </div>
  <n-drawer v-model:show="showDrawer" :width="502" placement="left">
    <n-drawer-content closable>
      <template #header>
        <div class="profile-primary">
          <img :src="profileImageSrc" alt="Profile Image" />
          <div v-if="statusStore.infoData.name" class="name-container">
            {{ statusStore.infoData.name }}
          </div>
        </div>
      </template>
      <div class="api-key-container">
        <span>API Key:</span>
        <span class="api-key-value" id="bizyair-profile-password">
          {{ statusStore.infoData.api_key }}
        </span>
        <vTooltips tips="Edit">
          <FilePenLine @click="statusStore.handleApiKeyDialog(true)" class="edit-icon" />
        </vTooltips>
      </div>
      <div class="level-container">
        <span>Level:</span>
        <span class="level-value">{{ levelText }}</span>
      </div>
      <div class="share-id-container">
        <div class="share-id-input-container">
          <span class="share-id-label">Share ID:</span>
          <span class="share-id-value" v-if="!isEditingShareId">
            {{ statusStore.infoData.share_id }}
          </span>
          <Input
            v-else
            class="share-id-input"
            ref="shareIdInput"
            v-model="statusStore.infoData.share_id"
            @keyup.enter="saveShareId"
          />
        </div>
        <div class="share-id-actions">
          <span v-show="!isEditingShareId">
            <vTooltips tips="Edit" v-if="canEditShareId">
              <FilePenLine @click="editShareId" class="edit-icon" />
            </vTooltips>
            <vTooltips
              v-else
              :tips="generateShareIDMessage(statusStore.infoData.last_share_id_update_at)"
            >
              <FilePenLine class="disabled-icon" />
            </vTooltips>
          </span>
          <span v-show="isEditingShareId">
            <vTooltips :tips="'Save'">
              <Save @click="saveShareId" class="save-icon" />
            </vTooltips>
          </span>
          <vTooltips :tips="'Copy'">
            <Copy @click="statusStore.copyText(statusStore.infoData.share_id)" class="copy-icon" />
          </vTooltips>
        </div>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>
<script setup lang="ts">
  import { put_share_id } from '@/api/user'
  // import vDrawer from '@/components/modules/vDrawer.vue'
  import { FilePenLine, Copy, Save } from 'lucide-vue-next'
  import { Input } from '@/components/ui/input'
  import vTooltips from '@/components/modules/v-tooltip.vue'
  import { useAlertDialog } from '@/components/modules/vAlertDialog'
  import { ref, computed } from 'vue'
  import { NDrawer, NDrawerContent } from 'naive-ui'

  import { useStatusStore } from '@/stores/userStatus'

  const statusStore = useStatusStore()

  const profileImageSrc =
    'data:image/png;base64,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'
  const isEditingShareId = ref(false)
  const recordShareId = ref('')
  const shareIdInput = ref<HTMLInputElement | null>(null)
  const levelMap: { [key: number]: string } = {
    1: 'Trial',
    2: 'Pro',
    3: 'Enterprise'
  }
  const showDrawer = ref(false)
  const levelText = computed(() => levelMap[statusStore.infoData.level])
  const canEditShareId = computed(() => {
    const lastUpdate = new Date(statusStore.infoData.last_share_id_update_at).getTime()
    return !isNaN(lastUpdate) && Date.now() - lastUpdate > 1000 * 60 * 60 * 24 * 365
  })

  const editShareId = () => {
    isEditingShareId.value = true
    recordShareId.value = statusStore.infoData.share_id
    setTimeout(() => {
      shareIdInput.value?.focus()
    }, 0)
  }

  const saveShareId = async () => {
    isEditingShareId.value = false
    const res = await useAlertDialog({
      title: 'Are you sure you want to modify it?',
      desc: 'If you make this change, it will render any models you have previously shared unavailable, and you are only allowed to make this modification once per year.',
      cancel: 'No, Keep It',
      continue: 'Yes, Delete It',
      z: 'z-9000'
    })
    if (!res) {
      statusStore.infoData.share_id = recordShareId.value
    } else {
      await put_share_id({ share_id: statusStore.infoData.share_id })
      statusStore.loginRefresh()
    }
  }

  const generateShareIDMessage = (date: string) => {
    const today = new Date(date)
    const nextYear = new Date(today)
    nextYear.setFullYear(today.getFullYear() + 1)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return `You can only change your share ID once a year. You need to wait until ${nextYear.toLocaleDateString(
      'en-US',
      options
    )} to make the modification.`
  }
  const toshowDrawer = async () => {
    statusStore.loginRefresh()
    showDrawer.value = true
  }
</script>
<style scoped>
  .profile-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    padding: 0 12px;
  }

  .profile-container:hover {
    background-color: #4a238e;
  }

  .icon-container {
    margin-right: 4px;
  }

  .profile-text {
    display: block;
    line-height: 32px;
    font-size: 14px;
  }

  .profile-primary {
    display: flex;
    align-items: center;
  }

  .name-container {
    margin-left: 16px;
  }

  .api-key-container {
    padding: 8px 0;
    display: flex;
    align-items: center;
    margin-top: 16px;
  }

  .api-key-value {
    margin-left: 8px;
  }

  .edit-icon {
    margin-left: 8px;
    cursor: pointer;
  }

  .level-container {
    padding: 8px 0;
    display: flex;
  }

  .level-value {
    margin-left: 8px;
  }

  .share-id-container {
    padding: 8px 0;
    display: flex;
    width: 100%;
  }

  .share-id-input-container {
    display: flex;
    align-items: center;
  }

  .share-id-label {
    white-space: nowrap;
  }

  .share-id-value {
    padding: 0 8px;
    margin-left: 8px;
  }

  .share-id-input {
    padding: 0 8px;
    margin-left: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    height: 28px;
  }

  .share-id-actions {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }

  .disabled-icon {
    margin-left: 8px;
    cursor: not-allowed;
  }

  .save-icon {
    cursor: pointer;
  }

  .copy-icon {
    cursor: pointer;
    margin-left: 8px;
  }
</style>
