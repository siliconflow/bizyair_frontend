<template>
  <v-dialog
    v-model:open="modelStoreObject.showWorkflowDialog"
    class="px-0 overflow-hidden pb-0 z-9000"
    layout-class="z-9000"
    content-class="custom-scrollbar max-h-[80vh] overflow-y-auto w-full rounded-tl-lg rounded-tr-lg custom-shadow"
    @on-close="onDialogClose"
  >
    <template #title
      ><span class="px-6 cursor-pointer" @click="handleToggleTitle">{{
        t('publish.workflow.title')
      }}</span></template
    >
    <div v-show="modelBox" class="px-6 pb-6">
      <v-item :label="t('publish.workflow.name.label')">
        <Input
          v-model:model-value="formData.name"
          :class="{ 'border-red-500': formData.nameError }"
          type="text"
          :placeholder="t('publish.workflow.name.placeholder')"
          @change="formData.nameError = false"
        />
      </v-item>
      <Button class="w-full mt-3" @click="nextStep">{{ t('publish.workflow.nextStep') }}</Button>
    </div>

    <vCustomAccordion :multiple="true" :active-index="acActiveIndex">
      <vCustomAccordionItem
        v-for="(e, i) in formData.versions"
        :key="i"
        :index="i"
        @toggle="handleToggle"
      >
        <template #title>
          <div
            class="bg-[#353535] z-1 px-6 py-4 w-full rounded-tl-lg rounded-tr-lg custom-shadow border-t-[1px] flex justify-between relative"
          >
            <span v-if="acActiveIndex !== i && e.version">{{ e.version }}</span>
            <span v-else>{{ t('publish.workflow.addVersion') }}</span>
            <Trash2
              v-if="formData.versions.length !== 1"
              class="w-4 h-4"
              @click.capture.stop="delVersion(i)"
            >
              <template #icon></template>
            </Trash2>
            <Progress
              v-if="e.progress && acActiveIndex && acActiveIndex !== i"
              :model-value="e.progress"
              class="absolute w-full bottom-0 left-0 h-1"
            />
          </div>
        </template>
        <template #default>
          <div class="bg-[#353535] px-6 pb-4">
            <v-item :label="t('publish.workflow.version.name')">
              <Input
                v-model:model-value="e.version"
                :class="{ 'border-red-500': e.versionError }"
                type="text"
                :placeholder="t('publish.workflow.version.placeholder')"
                @change="e.versionError = false"
              />
            </v-item>
            <v-item :label="t('publish.workflow.baseModel')">
              <v-select
                v-model:model-value="e.base_model"
                :class="{ 'border-red-500': e.baseModelError }"
                :placeholder="t('publish.workflow.baseModelPlaceholder')"
                @update:open="e.baseModelError = false"
              >
                <SelectItem
                  v-for="(e, i) in modelStoreObject.baseTypeLis"
                  :key="i"
                  :value="e.value"
                  >{{ e.label }}</SelectItem
                >
              </v-select>
            </v-item>
            <v-item :label="t('publish.workflow.uploadImage')">
              <vUploadImage
                v-model.modelValue="e.cover_urls"
                :previewPrc="e.cover_urls ? e.cover_urls[0] : ''"
                :class-name="e.imageError ? 'border-red-500' : ''"
                @done="imageUploadDone(i)"
              />
            </v-item>
            <v-item :label="t('publish.workflow.introduction')">
              <Markdown v-model.modelValue="e.intro" :editor-id="`myeditor${i}`" />
            </v-item>
            <v-item label="">
              <div class="flex items-center space-x-2 mt-2">
                <Switch
                  id="airplane-mode"
                  v-model:checked="e.public"
                  @update:checked="
                    val => {
                      handleChange(val, i)
                    }
                  "
                />
                <Label for="airplane-mode">{{ t('publish.workflow.publicVisible') }}</Label>
              </div>
            </v-item>
            <v-item v-show="!e.showUpload" :label="t('publish.workflow.file')">
              <div class="flex h-32 items-center justify-end relative">
                <p v-if="e.progress && e.fileName" class="absolute top-2 left-1 text-xs">
                  {{ e.fileName }}
                </p>
                <div v-if="e.progress" class="flex-1">
                  <Progress :model-value="e.progress" class="mt-4 h-3" />
                  <p class="text-center pt-2">
                    {{ e.progress }}% {{ t('publish.workflow.uploaded') }}
                    <span v-if="e.speed" class="pl-2"
                      >{{ t('publish.workflow.speed') }}: {{ e.speed }}</span
                    >
                  </p>
                </div>
                <Button v-if="e.hideUpload" class="ml-2" @click="cancelFile">{{
                  t('publish.workflow.cancel')
                }}</Button>
                <div v-if="!e.hideUpload" :class="{ 'w-full': !e.progress }">
                  <Button v-if="!e.progress" class="w-full my-2" @click="loadWorkflow()">{{
                    t('publish.workflow.loadFromWorkspace')
                  }}</Button>
                  <vUpload
                    :ref="e.ref"
                    model-type="ComfyUI"
                    accept=".json"
                    :file-name="e.file_name"
                    :class="{ 'border-red-500': e.filePathError }"
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
        </template>
      </vCustomAccordionItem>
    </vCustomAccordion>
    <template v-if="!modelBox" #foot>
      <div
        class="bg-[#353535] px-6 w-full h-14 rounded-tl-lg rounded-tr-lg custom-shadow border-t-[1px] flex justify-between items-center -mt-4"
      >
        <Button variant="outline" class="" @click="addVersions">{{
          t('publish.workflow.addVersion')
        }}</Button>
        <Button :disabled="disabledPublish" @click="submit">{{
          t('publish.workflow.publish')
        }}</Button>
      </div>
    </template>
    <div v-if="showLayoutLoading" class="z-50 w-full h-full absolute left-0 top-0"></div>
  </v-dialog>
</template>
<script setup lang="ts">
  import { useToaster } from '@/components/modules/toats/index'
  import { computed, inject, ref, watch } from 'vue'
  import { SelectItem } from '@/components/ui/select'
  import { Input } from '@/components/ui/input'
  import { Button } from '@/components/ui/button'
  import { Label } from '@/components/ui/label'
  import { Switch } from '@/components/ui/switch'
  import { Progress } from '@/components/ui/progress'
  import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
  import { modelStore } from '@/stores/modelStatus'
  import { create_models, put_model } from '@/api/model'
  import { Trash2 } from 'lucide-vue-next'
  import vDialog from '@/components/modules/vDialog.vue'
  import vSelect from '@/components/modules/vSelect.vue'
  import vItem from '@/components/modules/vItem.vue'
  import vCustomAccordion from '@/components/modules/vCustomAccordion.vue'
  import vCustomAccordionItem from '@/components/modules/vCustomAccordionItem.vue'
  import vUpload from '@/components/modules/vUpload/index.vue'
  import vUploadImage from '@/components/modules/vUpload/vUploadImage.vue'
  import Markdown from '@/components/markdown/Index.vue'
  import { uploadFile } from '@/components/modules/vUpload/virtualUpload'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
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
  function handleChange(val: any, index: number) {
    if (formData.value.versions) {
      formData.value.versions[index].public = val
    }
  }
  async function delVersion(index: number) {
    const res = await useAlertDialog({
      title: t('publish.workflow.confirmDelete.title'),
      desc: t('publish.workflow.confirmDelete.desc'),
      cancel: t('publish.workflow.confirmDelete.cancel'),
      continue: t('publish.workflow.confirmDelete.continue'),
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
      useToaster.error(t('publish.workflow.errors.enterName'))
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
        useToaster.error(t('publish.workflow.errors.enterVersion', { index: i + 1 }))
        acActiveIndex.value = i
        break
      }
      if (!e.base_model) {
        e.baseModelError = true
        useToaster.error(t('publish.workflow.errors.selectBaseModel', { index: i + 1 }))
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
        useToaster.error(t('publish.workflow.errors.enterFilePath', { index: i + 1 }))
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

    useToaster.success(t('publish.workflow.success'))
    setTimeout(() => {
      onDialogClose()
    }, 1500)
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
</script>
<style scoped></style>
