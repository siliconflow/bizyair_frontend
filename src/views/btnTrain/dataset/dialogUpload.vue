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
        <n-form-item label="Input" path="inputValue">
          <n-input v-model:value="formData.name" placeholder="Input" />
        </n-form-item>
        
        <n-form-item label="Annotated" path="inputValue">
          <n-switch v-model:value="formData.versions[0].annotated" />
        </n-form-item>
        <n-form-item label="Upload Image" path="inputValue">
          <vUploadImage
            v-model="formData.versions[0].cover_urls"
            :preview-prc="formData.versions[0].cover_urls ? formData.versions[0].cover_urls[0] : ''"
            @done="imageUploadDone"
          />
        </n-form-item>
        <n-form-item label="Files" path="inputValue">
          <vUploadMulti
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
          <n-button type="primary" @click="submit">Publish</n-button>
        </div>
      </template>
  </n-card>
  </n-modal>
</template>

<script setup lang="ts">
  import { useToaster } from '@/components/modules/toats/index'
  import vUploadImage from '@/components/modules/vUpload/vUploadImage.vue'
  import vUploadMulti from '@/components/modules/vUpload/vUploadMulti.vue'
  import { NModal, NCard, NForm, NFormItem, NInput, NButton, NSwitch } from 'naive-ui'
  import { create_dataset, put_dataset } from '@/api/dataset'
  import { useDatasetStore } from '@/stores/datasetStore'
  import { ref } from 'vue';
  
  const datasetStore = useDatasetStore()
  const isMultiUploading = ref(false)

  const formData = ref({
    ...datasetStore.formDetail,
  })
  

  const onDialogClose = () => {
    
    if (isMultiUploading.value) {
      useToaster({
        type: 'error',
        message: 'Please wait for the file to finish uploading'
      })
      return
    }
    if (datasetStore.clearDetail) {
      datasetStore.clearDetail()
      formData.value = {
        ...datasetStore.formDetail
      }
      datasetStore.showUploadDialog = false
    }
    datasetStore.setListDialog(true)
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
    const tempData = { ...formData.value }
    const tempVersionsFile = tempData.versions[0].files.map((e:any) => ({ sign: e.sha256sum, path: e.path }))
    tempData.versions[0].files = tempVersionsFile
    tempData.versions[0].cover_urls = [tempData.versions[0].cover_urls]
    if (tempData.id) {
      await put_dataset(tempData)
    } else {
      await create_dataset(tempData)
    }
    onDialogClose()
    datasetStore.getDatasetList()
    datasetStore.current = 1
    datasetStore.setListDialog(true)
  }
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