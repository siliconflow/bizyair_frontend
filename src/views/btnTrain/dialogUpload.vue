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
        <!-- <n-collapse 
          ref="collapseRef"
          :default-expanded-names="defaultExpandedNames" 
          accordion 
          display-directive="show"
          arrow-placement="right">
          <n-collapse-item 
            v-for="(e, i) in formData.versions" 
            :key="i" 
            :title="`versions${i + 1}`" 
            :name="i">
            <template #header-extra>
              <Trash2
                v-if="formData.versions.length !== 1"
                class="trash-icon"
                @click.capture.stop="delVersion(i)"
              />
            </template> -->
            <!-- <n-form-item label="Version" path="inputValue">
              <input v-model="formData.versions[0].version" type="hidden" />
            </n-form-item> -->
            <!-- <n-form-item label="Description" path="inputValue">
              <Markdown v-model="formData.versions[0].intro" editor-id="myeditor1" />
            </n-form-item> -->
            <n-form-item label="Annotated" path="inputValue">
              <n-switch v-model:value="formData.versions[0].annotated" />
            </n-form-item>
            <n-form-item label="Upload Image" path="inputValue">
              <vUploadImage
                v-model.modelValue="formData.versions[0].cover_urls"
                :preview-prc="formData.versions[0].cover_urls ? formData.versions[0].cover_urls[0] : ''"
                @done="imageUploadDone"
              />
            </n-form-item>
            <n-form-item label="Files" path="inputValue">
              <vUploadMulti
                v-model:value="formData.versions[0].files"
                :isVerify="formData.versions[0].annotated"
                @is-uploading="isMultiUploading = true"
                @upload-done="isMultiUploading = false"
              />

            </n-form-item>
          <!-- </n-collapse-item>
        </n-collapse> -->
      </n-form>

      <template #footer>
        <div class="footer-content">
          <!-- <n-button tertiary @click="addVersion">Add Version</n-button>
          <span> -->
            <n-button tertiary @click="cancel">cancel</n-button>
            <n-button type="primary" @click="submit">Publish</n-button>
          <!-- </span> -->
        </div>
      </template>
  </n-card>
  </n-modal>
</template>

<script setup lang="ts">
  import { useToaster } from '@/components/modules/toats/index'
  // import { computed, inject, ref, watch } from 'vue'
  
  // import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
  // import { Trash2 } from 'lucide-vue-next'
  // import { useConfirm } from '@/components/modules/vConfirm/index'
  // import Markdown from '@/components/markdown/Index.vue'
  import vUploadImage from '@/components/modules/vUpload/vUploadImage.vue'
  import vUploadMulti from '@/components/modules/vUpload/vUploadMulti.vue'
  import { NModal, NCard, NForm, NFormItem, NInput, NButton, NSwitch } from 'naive-ui'
  // NCollapse, NCollapseItem 
  import { create_dataset, put_dataset } from '@/api/dataset'
  import { useDatesetStore } from '@/stores/datasetStore'
  import { ref } from 'vue';
  // import { create_models, put_model } from '@/api/model'
  
  const datasetStore = useDatesetStore()
  // const defaultExpandedNames = ref([0])
  // const collapseRef = ref<HTMLDivElement | null>(null)
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
    
  }
  const imageUploadDone = () => {
    console.log('imageUploadDone')
  }
  // const addVersion = () => {
  //   formData.value.versions.push({
  //     intro: '',
  //     annotated: false,
  //     cover_urls: [],
  //     files: []
  //   })
  // }
  // async function delVersion(index: number) {
  //   console.log(index)
  //   const res = await useAlertDialog({
  //     title: 'Are you sure you want to delete this version?',
  //     desc: 'This action cannot be undone.',
  //     cancel: 'No, Keep It',
  //     continue: 'Yes, Delete It',
  //     z: 'z-9000'
  //   })
  //   if (!res) return
  // }
  const cancel = () => {
    // datasetStore.setDialogStatus(false)
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
  // span{
  //   display: flex;
  //   gap: 16px;
  // }
}
</style>