<template>
  <n-modal
    v-model:show="statusStore.showUploadAvatarDialog"
    preset="card"
    style="width: 580px"
    title="avatar"
    :auto-focus="false"
    :mask-closable="false"
    :bordered="false"
  >
    <ul class="avatar-list">
      <li v-for="(e, i) in avatar" :key="i">
        <vImage class="pic" :src="e" alt="" @click="selectThis(e)" />
      </li>
      <!-- <li>
        <vUploadImage
          className="w-24 h-24"
          v-model.modelValue="cover_url"
          @done="imageUploadDone"
        />
      </li> -->
    </ul>
  </n-modal>
</template>
<script setup lang="ts">
  import { NModal } from 'naive-ui'
  import { useStatusStore } from '@/stores/userStatus'
  import { ref } from 'vue'
  import vImage from '@/components/modules/vImage.vue'
  // import vUploadImage from '@/components/modules/vUpload/vUploadImage.vue'

  const statusStore = useStatusStore()
  const avatar = ref([
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/ViKdyI5vrD7XGNCXHuVTW4sPUXNusj3W.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/YDP6ZVq41yj9HCn4oQklNps7gkYXmYtF.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/am4o3LW21fiCtkHBn6sVcJQCabyXPRpP.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/SoEIUUVIlRI4jmS0oJGksF2oYWTXiFRH.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/neWI6jKICQYZmhGjrr4EEQ3ayyP9mTZr.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/5YPQStbsKrGqkZzwGvkHXzGhy2XX5bcb.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/yXPbljOblCjqRTWgbcHIhV6Qmtbo3Q3M.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/6GjafFtlRKO0Tb7j4pQFSUHBsRinI8Fl.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/qcVtbtFeBtk1bejEQ2lik4uUfvF6grKK.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/BRuIn69IDL74l0K5qqi4HA3GEqLSS209.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/NXywfJUeDimurtmtVmVM8PrkuFwyafoN.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/8JHxWscVaxw3at3uzhKqb2HR6V1O2YGr.webp',
    'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/McHuaZdFjCoqUf57m4j5XVanuDDRJTo1.webp'
  ])
  // const cover_url = ref('')
  const selectThis = (e: string) => {
    statusStore.usersMetadata.avatar = e
    statusStore.showUploadAvatarDialog = false
  }
  // const imageUploadDone = () => {
  //   statusStore.usersMetadata.avatar = cover_url.value
  //   statusStore.showUploadAvatarDialog = false
  // }
</script>
<style scoped lang="less">
  .avatar-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      margin: 0;
      padding: 0;
      width: 100px;
      height: 100px;
      .pic {
        width: 100px;
        cursor: pointer;
      }
    }
    .upload-image {
      width: 100px;
      height: 100px;
    }
  }
</style>
