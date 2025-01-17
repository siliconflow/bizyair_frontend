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
      style="max-width: 900px;max-height: 86vh;"
      content-style="padding: 0;height: 100%;overflow-y: auto;"
      @close="onDialogClose">
      <template #header>
        <span class="header-title">Upload Dataset</span>
      </template>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        size="medium"
        class="form-content"
      >
        <n-form-item label="Input" path="inputValue">
          <n-input v-model:value="formData.inputValue" placeholder="Input" />
        </n-form-item>
        <n-form-item label="Description" path="inputValue">
          <Markdown v-model="formData.intro" editor-id="myeditor1" />
        </n-form-item>
        <n-form-item label="Annotated" path="inputValue">
          <n-switch v-model:value="formData.public" />
        </n-form-item>
        <n-form-item label="Upload Image" path="inputValue">
          <vUploadImage
            v-model.modelValue="formData.cover_urls"
            :class-name="formData.imageError ? 'input-error' : ''"
            :preview-prc="formData.cover_urls ? formData.cover_urls[0] : ''"
            @done="imageUploadDone"
          />
        </n-form-item>
        <n-form-item label="File" path="inputValue">
          <vUploadMulti
            v-model:value="formData.file"
            :file-name="formData.fileName"
            :model-type="formData.modelType"
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
  // import { useToaster } from '@/components/modules/toats/index'
  // import { computed, inject, ref, watch } from 'vue'
  
  // import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
  import Markdown from '@/components/markdown/Index.vue'
  import vUploadImage from '@/components/modules/vUpload/vUploadImage.vue'
  import vUploadMulti from '@/components/modules/vUpload/vUploadMulti.vue'
  import { NModal, NCard, NForm, NFormItem, NInput, NButton, NSwitch } from 'naive-ui'
  import { useDatesetStore } from '@/stores/datasetStore'
  import { ref } from 'vue';
  // import { create_models, put_model } from '@/api/model'
  
  const datasetStore = useDatesetStore()

  const formData = ref({
    ...datasetStore.formDetail,
    intro: '',
    public: false
  })
  const rules = ref(datasetStore.rules)

  const onDialogClose = () => {
    if (datasetStore.clearDetail) {
      datasetStore.clearDetail()
      datasetStore.showUploadDialog = false
    }
    
  }
  const imageUploadDone = () => {
    console.log('imageUploadDone')
  }

  const cancel = () => {
    // datasetStore.setDialogStatus(false)
    onDialogClose()
  }
  const submit = () => {
    // datasetStore.setDialogStatus(false)
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