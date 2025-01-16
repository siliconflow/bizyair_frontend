<template>
  <n-modal
    v-model:show="modelStoreObject.showWorkflowDialog"
    preset="card"
    size="huge"
    :bordered="false"
    :on-after-leave="onDialogClose"
    content-style="padding: 0"
    header-style="padding: 20px"
    footer-style="padding: 0"
    style="max-width: 900px"
  >

    <template #header>
      <span class="header-title" @click="handleToggleTitle">Publish a Workflow</span>
    </template>

    <div v-show="modelBox" class="modal-content">
      <v-item label="Model Name">
        <n-input
          v-model:value="formData.name"
          :class="{ 'input-error': formData.nameError }"
          type="text"
          placeholder="Enter Model Name"
          @change="formData.nameError = false"
        />
      </v-item>
      <input webkitdirectory class="w-[500px] bg-red-400 h-[200px]" type="file" @change="test123123" />
      <n-button type="primary" class="next-button" @click="nextStep">Next Step</n-button>
    </div>

    <vCustomAccordion :multiple="true" :active-index="acActiveIndex">
      <vCustomAccordionItem
        v-for="(e, i) in formData.versions"
        :key="i"
        :index="i"
        @toggle="handleToggle"
      >
        <template #title>
          <div class="accordion-title">
            <span v-if="acActiveIndex !== i && e.version">{{ e.version }}</span>
            <span v-else>Add Version</span>
            <!-- <Progress
              v-if="e.progress && acActiveIndex && acActiveIndex !== i"
              :model-value="e.progress"
              class="progress-bar"
            /> -->
            <n-progress
              v-if="e.progress && acActiveIndex && acActiveIndex !== i"
              type="line"
              :show-indicator="false"
              color="#6D28D9"
              :percentage="e.progress"
              class="progress-bar"
            />
            <Trash2
              v-if="formData.versions.length !== 1"
              class="trash-icon"
              @click.capture.stop="delVersion(i)"
            />
          </div>
        </template>
        <div class="accordion-content">
          <v-item label="Version Name">
            <n-input
              v-model:value="e.version"
              :class="{ 'input-error': e.versionError }"
              type="text"
              placeholder="Version Name"
              @change="e.versionError = false"
            />
          </v-item>
          <v-item label="Base Model">
            <n-select 
              v-model:value="e.base_model" 
              placeholder="Select Base Model" 
              :options="modelStoreObject.baseTypeLis" />
            <!-- <v-select
              v-model:model-value="e.base_model"
              :class="{ 'input-error': e.baseModelError }"
              placeholder="Select Base Model"
              @update:open="e.baseModelError = false"
            >
              <SelectItem
                v-for="(e, i) in modelStoreObject.baseTypeLis"
                :key="i"
                :value="e.value"
                >{{ e.label }}</SelectItem
              >
            </v-select> -->
          </v-item>
          <v-item label="Upload Image">
            <vUploadImage
              v-model.modelValue="e.cover_urls"
              :class-name="e.imageError ? 'input-error' : ''"
              :preview-prc="e.cover_urls ? e.cover_urls[0] : ''"
              @done="imageUploadDone(i)"
            />
          </v-item>
          <v-item label="Introduction">
            <Markdown v-model.modelValue="e.intro" :editor-id="`myeditor${i}`" />
          </v-item>
          <v-item label="">
            <div class="switch-container">
              <n-switch v-model:value="e.public" />
              <label>Publicly Visible</label>
            </div>
          </v-item>
          <v-item v-show="!e.showUpload" label="File">
            <div class="file-upload-container">
              <p v-if="e.progress && e.fileName" class="file-name">
                {{ e.fileName }}
              </p>
              <div v-if="e.progress" class="progress-container">
                <n-progress
                  type="line"
                  :show-indicator="false"
                  color="#6D28D9"
                  :percentage="e.progress"
                />
                <!-- <Progress :model-value="e.progress" class="progress-bar" /> -->
                <p class="progress-text">
                  {{ e.progress }}% Uploaded
                  <span v-if="e.speed" class="speed-text">Speed: {{ e.speed }}</span>
                </p>
              </div>
              <n-button v-if="e.hideUpload" type="primary" class="cancel-button" @click="cancelFile">cancel</n-button>
              <div v-if="!e.hideUpload" :class="{ 'full-width': !e.progress }">
                <n-button v-if="!e.progress" type="primary" class="load-button" @click="loadWorkflow()"
                  >Load from current workspace</n-button
                >
                <vUpload
                  :ref="e.ref"
                  model-type="ComfyUI"
                  accept=".json"
                  :file-name="e.file_name"
                  :class="{ 'input-error': e.filePathError }"
                  @path="path => handlePath(path, i)"
                  @start="() => startUpload(i)"
                  @success="data => successUpload(data, i)"
                  @error="() => errorUpload(i)"
                  @upload-info="data => handleUploadInfo(data, i)"
                  @progress="p => fnProgress(p, i)"
                />
              </div>
            </div>
          </v-item>
        </div>
      </vCustomAccordionItem>
    </vCustomAccordion>
    <template v-if="!modelBox" #footer>
      <div class="footer-content">
        <n-button tertiary @click="addVersions">Add Version</n-button>
        <n-button type="primary" :disabled="disabledPublish" @click="submit">Publish</n-button>
      </div>
    </template>
    <div v-if="showLayoutLoading" class="loading-overlay"></div>
  </n-modal>
</template>

<script setup lang="ts">
  import { useToaster } from '@/components/modules/toats/index'
  import { computed, inject, ref, watch } from 'vue'
  // import { SelectItem } from '@/components/ui/select'
  // import { Input } from '@/components/ui/input'
  
  // import { Button } from '@/components/ui/button'
  // import { Label } from '@/components/ui/label'
  // import { Switch } from '@/components/ui/switch'
  // import { Progress } from '@/components/ui/progress'
  import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
  import { modelStore } from '@/stores/modelStatus'
  import { create_models, put_model } from '@/api/model'
  import { Trash2 } from 'lucide-vue-next'
  // import vDialog from '@/components/modules/vDialog.vue'
  // import vSelect from '@/components/modules/vSelect.vue'
  import vItem from '@/components/modules/vItem.vue'
  import vCustomAccordion from '@/components/modules/vCustomAccordion.vue'
  import vCustomAccordionItem from '@/components/modules/vCustomAccordionItem.vue'
  import vUpload from '@/components/modules/vUpload/index.vue'
  import vUploadImage from '@/components/modules/vUpload/vUploadImage.vue'
  import Markdown from '@/components/markdown/Index.vue'
  import { uploadFile } from '@/components/modules/vUpload/virtualUpload'

  import { NModal, NButton, NInput, NProgress, NSwitch, NSelect } from 'naive-ui'

  const comfyUIApp: any = inject('comfyUIApp')

  const modelStoreObject = modelStore()
  const modelBox = ref(true)
  const formData = ref({ ...modelStoreObject.modelDetail })
  const acActiveIndex = ref(-1)
  const showLayoutLoading = ref(false)
  const handleToggle = (i: number) => {
    acActiveIndex.value = i
    if (modelBox.value) {
      modelBox.value = false
    }
  }
  const handleToggleTitle = () => {
    acActiveIndex.value = -1
    modelBox.value = true
  }
  const disabledPublish = computed(() => {
    const progress = formData.value.versions
      .map(e => e.progress)
      .some((e, i) => e !== 100 && formData.value.versions[i].file_upload_id)

    return progress
  })
  // function handleChange(val: any, index: number) {
  //   if (formData.value.versions) {
  //     formData.value.versions[index].public = val
  //   }
  // }
  async function delVersion(index: number) {
    const res = await useAlertDialog({
      title: 'Are you sure you want to delete this version?',
      desc: 'This action cannot be undone.',
      cancel: 'No, Keep It',
      continue: 'Yes, Delete It',
      z: 'z-9000'
    })
    if (!res) return
    const tempData = { ...formData.value }
    if (acActiveIndex.value === tempData.versions.length - 1) {
      acActiveIndex.value = Number(acActiveIndex.value) - 1
    }
    tempData.versions = tempData.versions || []
    tempData.versions.splice(index, 1)
    modelStoreObject.setModelDetail(tempData)
    if (tempData.versions.length === 1) {
      acActiveIndex.value = 0
    }
    if (tempData.versions.length === 0) {
      modelBox.value = true
    }
  }
  function addVersions() {
    const tempData = { ...formData.value }
    tempData.versions = tempData.versions || []
    tempData.versions.push({
      version: '',
      base_model: '',
      intro: '',
      public: false,
      filePath: '',
      sign: '',
      path: ''
    })
    modelStoreObject.setModelDetail(tempData)
    modelBox.value = false
    acActiveIndex.value = tempData.versions.length - 1
  }
  function nextStep() {
    if (!formData.value.name) {
      useToaster.error('Please enter the model name')
      formData.value.nameError = true
      return
    }
    if (formData.value.versions.length) {
      acActiveIndex.value = 0
      modelBox.value = false
    } else {
      addVersions()
    }
  }
  function imageUploadDone(i: number) {
    formData.value.versions[i].imageDone = true
    formData.value.versions[i].imageError = false
  }
  function verifyVersion() {
    const tempData = { ...formData.value }
    tempData.versions = tempData.versions || []
    for (let i = 0; i < tempData.versions.length; i++) {
      const e = tempData.versions[i]
      if (!e.version) {
        e.versionError = true
        useToaster.error(`Please enter the version name for version ${i + 1}`)
        acActiveIndex.value = i
        break
      }
      if (!e.base_model) {
        e.baseModelError = true
        useToaster.error(`Please select the base model for version ${i + 1}`)
        acActiveIndex.value = i
        break
      }
      // if (e.cover_urls && !e.imageDone) {
      //   e.imageError = true
      //   useToaster.error(`Please wait until the image is uploaded for version ${i + 1}`)
      //   acActiveIndex.value = i
      //   break
      // }
      if (!e.sign) {
        e.filePathError = true
        useToaster.error(`Please enter the file path for version ${i + 1}`)
        acActiveIndex.value = i
        break
      }
    }
    return tempData.versions.every((e: any) => e.version && e.base_model && e.sign)
  }
  const fnProgress = (p: number, i: number) => {
    formData.value.versions[i].progress = p
  }
  const handlePath = (path: string, i: number) => {
    formData.value.versions[i].path = path
  }
  const startUpload = (i: number) => {
    formData.value.versions[i].filePathError = false
  }
  const successUpload = (data: any, i: number) => {
    formData.value.versions[i].sign = data.sha256sum
    formData.value.versions[i].filePathError = false
  }
  const errorUpload = (i: number) => {
    if (formData.value.versions[i].progress) {
      delete formData.value.versions[i].progress
    }
  }
  const handleUploadInfo = (data: any, i: number) => {
    data.speed && (formData.value.versions[i].speed = data.speed)
    data.fileName && (formData.value.versions[i].fileName = data.fileName)
  }
  const cancelFile = () => {
    formData.value.versions[0].progress = 0
    formData.value.versions[0].fileName = ''
    formData.value.versions[0].hideUpload = false
    formData.value.versions[0].sign = ''
    formData.value.versions[0].path = ''
  }
  const loadWorkflow = async () => {
    const graph = await comfyUIApp.graphToPrompt()
    const file = new File(
      [JSON.stringify(graph.workflow)],
      `${formData.value.name}-workflow.json`,
      {
        type: 'application/json'
      }
    )
    uploadFile(file, 'Workflow', (sha256sum: string) => {
      formData.value.versions[0].progress = 100
      formData.value.versions[0].fileName = `${formData.value.name}-workflow.json`
      formData.value.versions[0].hideUpload = true
      formData.value.versions[0].sign = sha256sum
      formData.value.versions[0].path = `${formData.value.name}-workflow.json`
    })
  }
  async function submit() {
    if (!verifyVersion()) {
      return
    }
    showLayoutLoading.value = true
    setTimeout(() => {
      showLayoutLoading.value = false
    }, 5000)
    const tempData = { ...formData.value }
    delete tempData.nameError
    tempData.versions.forEach((e: any) => {
      delete e.baseModelError
      delete e.filePath
      delete e.filePathError
      delete e.versionError
      delete e.speed
      delete e.fileName
      delete e.imageError
      delete e.showUpload
      delete e.imageDone
      if (typeof e.cover_urls === 'string') {
        e.cover_urls = [e.cover_urls]
      }
    })
    tempData.type = 'Workflow'
    if (tempData.id) {
      await put_model(tempData)
    } else {
      await create_models(tempData)
    }

    useToaster.success('published successfully')
    onDialogClose()
  }
  const onDialogClose = () => {
    modelStoreObject.setDialogStatusWorkflow(false, 0)
    modelStoreObject.clearModelDetail()
    modelBox.value = true
    acActiveIndex.value = -1
    showLayoutLoading.value = false
    modelStoreObject.uploadModelDone()
  }
  watch(
    () => modelStoreObject.modelDetail,
    (val: any) => {
      formData.value = val
      if (formData.value.versions && formData.value.versions.length) {
        formData.value.versions.forEach((e: any) => {
          if (e.file_name) {
            e.fileName = e.file_name
          }
        })
      }
    },
    {
      deep: true
    }
  )
  watch(
    () => modelStoreObject.showVersionId,
    (val: any) => {
      const i = formData.value.versions.findIndex((e: any) => e.id == val)
      setTimeout(() => {
        acActiveIndex.value = i
      })
      if (i != -1) {
        modelBox.value = false
      }
    },
    {
      deep: true
    }
  )

  const test123123 = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      console.log(target.files);
      for (let i = 0; i < target.files.length; i++) {
        const file = target.files[i];
        console.log(URL.createObjectURL(file));
      }
    }
  // };
    // console.log(e.target.files)
    // for (let i = 0; i < e.target.files.length; i++) {
    //   const file = e.target.files[i]
    //   console.log(URL.createObjectURL(file))

    // }
  }
</script>

<style scoped lang="less">
.custom-modal {
  max-width: 800px;
}
.header-title {
  cursor: pointer;
}

.modal-content {
  padding: 0 24px 24px 24px;
}

.next-button {
  width: 100%;
  margin-top: 12px;
}

.accordion-title {
  background-color: #353535;
  padding: 16px 24px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-top: 1px solid #444;
  display: flex;
  justify-content: space-between;
  position: relative;
}

.trash-icon {
  width: 16px;
  height: 16px;
}

.progress-bar {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  height: 4px;
}

.accordion-content {
  background-color: #353535;
  padding: 0 24px 16px 24px;
}

.input-error {
  border-color: #ef4444;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.file-upload-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}

.file-name {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 12px;
}

.progress-container {
  flex: 1;
  margin-top: 54px;
}

.progress-text {
  text-align: center;
  padding-top: 8px;
}

.speed-text {
  padding-left: 8px;
}

.cancel-button {
  margin-left: 8px;
}

.load-button {
  width: 100%;
  margin: 8px 0;
}

.full-width {
  width: 100%;
}

.footer-content {
  background-color: #353535;
  padding: 0 24px;
  height: 56px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-top: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -16px;
}

.loading-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 50;
}
</style>