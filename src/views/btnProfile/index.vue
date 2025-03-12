<template>
  <div @click="statusStore.showInfoDialog = true" variant="outline" class="profile-container">
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
    <dialogInfo />
    <DialogUploadInfo />
    <uploadAvatar />
    <DialogCoinsLis />
  </div>

</template>
<script setup lang="ts">
  // import { ref } from 'vue'
  // import { NDrawer, NDrawerContent } from 'naive-ui'
  import dialogInfo from './DialogInfo.vue'
  import DialogUploadInfo from './DialogUploadInfo.vue'
  import uploadAvatar from './uploadAvatar.vue'
  import DialogCoinsLis from './DialogCoinsLis.vue'
  import { useStatusStore } from '@/stores/userStatus'
  

  const statusStore = useStatusStore()
  
  
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

</style>
