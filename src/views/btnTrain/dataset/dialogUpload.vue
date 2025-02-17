<template>
  <n-modal
    v-model:show="datasetStore.showUploadDialog"
    size="huge"
    :bordered="false"
    :auto-focus="false"
    :close-on-esc="false"
    :mask-closable="false"
    :on-after-leave="onDialogClose"
  >
    <n-card 
      closable 
      class="custom-scrollbar"
      header-style="padding: 20px"
      footer-style="padding: 0"
      style="max-width: 900px;max-height: 82vh;"
      content-style="padding: 0;height: 100%;overflow-y: auto;"
      :auto-focus="false"
      @close="onDialogClose">
      <template #header>
        <span class="header-title">Upload Dataset</span>
      </template>

      <n-form
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        size="medium"
        class="form-content"
      >
        <n-form-item label="Name" path="inputValue">
          <n-input v-model:value="formData.name" placeholder="Input" />
        </n-form-item>
        
        <!-- <n-form-item label="Annotated" path="inputValue">
          <n-switch v-model:value="formData.versions[0].annotated" />
        </n-form-item> -->
        <n-form-item label="Cover" path="inputValue">
          <vUploadImage
            v-model="formData.versions[0].cover_urls"
            :preview-prc="formData.versions[0].cover_urls ? formData.versions[0].cover_urls[0] : ''"
            @done="imageUploadDone"
          />
        </n-form-item>
        <n-form-item label="Files" path="inputValue">
          <vUploadMulti
            ref="uploadRef"
            v-model:value="formData.versions[0].files"
            :is-verify="formData.versions[0].annotated"
            @is-uploading="isMultiUploading = true"
            @upload-done="isMultiUploading = false"
          />

        </n-form-item>
      </n-form>

      <template #footer>
        <div class="footer-content">
          <n-button tertiary @click="cancel">cancel</n-button>
          <n-button type="primary" :disabled="true" v-if="isMultiUploading">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="2" r="0" fill="currentColor"><animate attributeName="r" begin="0" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(45 12 12)"><animate attributeName="r" begin="0.125s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(90 12 12)"><animate attributeName="r" begin="0.25s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(135 12 12)"><animate attributeName="r" begin="0.375s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(180 12 12)"><animate attributeName="r" begin="0.5s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(225 12 12)"><animate attributeName="r" begin="0.625s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(270 12 12)"><animate attributeName="r" begin="0.75s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(315 12 12)"><animate attributeName="r" begin="0.875s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle></svg>
            </template>
            Publish
          </n-button>
          <n-button type="primary" @click="submit" v-else>Publish</n-button>
        </div>
      </template>
  </n-card>
  </n-modal>
</template>

<script setup lang="ts">
  import { useToaster } from '@/components/modules/toats/index'
  import vUploadImage from '@/components/modules/vUpload/vUploadImage.vue'
  import vUploadMulti from '@/components/modules/vUpload/vUploadMulti.vue'
  import { NModal, NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui'
  // NSwitch
  import { create_dataset, put_dataset } from '@/api/dataset'
  import { useDatasetStore } from '@/stores/datasetStore'
  import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
  import { ref, watch } from 'vue';
  
  const datasetStore = useDatasetStore()
  const isMultiUploading = ref(false)

  const formData = ref({
    ...datasetStore.formDetail,
  })

  const uploadRef = ref(null)
  

  const onDialogClose = async () => {
    
    if (formData.value.versions[0].files.length != 0 && isMultiUploading.value) {
      // useToaster({
      //   type: 'error',
      //   message: 'Please wait for the file to finish uploading'
      // })
      // return

      const res = await useAlertDialog({
        title: 'Are you sure you want to cancel?',
        desc: 'This operation will result in the loss of upload progress.',
        cancel: 'No, Keep It',
        continue: 'Yes, Cancel It',
        z: 'z-9000'
      })
      if (!res) return
      
    }
    if (datasetStore.clearDetail) {
      datasetStore.clearDetail()
      formData.value = {
        ...datasetStore.formDetail
      }
      datasetStore.showUploadDialog = false
    }
    datasetStore.setListDialog(true)
    if (uploadRef.value) {
      (uploadRef.value as {clearAll: () => {}}).clearAll()
    }
  }
  const imageUploadDone = () => {
    console.log('imageUploadDone')
  }
  const cancel = () => {
    onDialogClose()
  }
  const verifyVersion = () => {
    if (!formData.value.name) {
      useToaster({
        type: 'error',
        message: 'Please enter the dataset name'
      })
      return false
    }
    if (formData.value.versions[0].files.length == 0) {
      useToaster({
        type: 'error',
        message: 'Please upload the dataset file'
      })
      return false
    }
    if (isMultiUploading.value) {
      useToaster({
        type: 'error',
        message: 'Please wait for the file to finish uploading'
      })
      return false
    }
    return !isMultiUploading.value
  }
  const submit = async () => {
    if (!verifyVersion()) {
      return
    }
    const tempData = JSON.parse(JSON.stringify(formData.value))
    const tempVersionsFile = tempData.versions[0].files.map((e:any) => ({ sign: e.sha256sum, path: e.path }))
    tempData.versions[0].files = tempVersionsFile
    if (typeof tempData.versions[0].cover_urls === 'string') {
      tempData.versions[0].cover_urls = [tempData.versions[0].cover_urls]
    }
    if (tempData.id) {
      await put_dataset(tempData)
    } else {
      await create_dataset(tempData)
    }
    onDialogClose()
    datasetStore.current = 1
    datasetStore.annotated = ''
    
    datasetStore.getDatasetList()
    datasetStore.setListDialog(true)
  }
  
  watch(() => datasetStore.showUploadDialog, (val) => {
    if (val) {
      isMultiUploading.value = false
    }
  })
</script>

<style scoped lang="less">
.form-content{
  padding: 24px;
}
.footer-content{
  display: flex;
  justify-content: flex-end;
  padding: 24px;
  gap: 16px;
}
</style>