<template>
  <!-- <btnMenu :show_cases="show_cases" buttonText="Examples" icon="book-open" :isJson="true">
    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24">
      <path fill="none" stroke="#ddd" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 16.008V7.99a1.98 1.98 0 0 0-1-1.717l-7-4.008a2.02 2.02 0 0 0-2 0L4 6.273c-.619.355-1 1.01-1 1.718v8.018c0 .709.381 1.363 1 1.717l7 4.008a2.02 2.02 0 0 0 2 0l7-4.008c.619-.355 1-1.01 1-1.718M12 22V12m0 0l8.73-5.04m-17.46 0L12 12" />
    </svg>
  </btnMenu> -->
  <!-- <Form as="" :validation-schema="formSchema"> -->
  <div
    @click="modelStoreObject.setDialogStatus(true)"
    class="flex items-center hover:bg-[#4A238E] cursor-pointer relative px-3"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="#ddd"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M21 16.008V7.99a1.98 1.98 0 0 0-1-1.717l-7-4.008a2.02 2.02 0 0 0-2 0L4 6.273c-.619.355-1 1.01-1 1.718v8.018c0 .709.381 1.363 1 1.717l7 4.008a2.02 2.02 0 0 0 2 0l7-4.008c.619-.355 1-1.01 1-1.718M12 22V12m0 0l8.73-5.04m-17.46 0L12 12"
      />
    </svg>
    <span class="block leading h-full leading-8 text-sm">Publish</span>
  </div>
  <v-dialog
    v-model:open="modelStoreObject.showDialog"
    @onClose="onDialogClose"
    class="px-0 overflow-hidden pb-0 z-9000"
    v-if="modelStoreObject.showDialog"
    layoutClass="z-9000"
    contentClass="custom-scrollbar max-h-[80vh] overflow-y-auto w-full rounded-tl-lg rounded-tr-lg custom-shadow"
  >
    <template #title
      ><span
        class="px-6 cursor-pointer"
        @click="
          acActiveIndex = -1
          modelBox = true
        "
        >Publish a Model</span
      ></template
    >
    <div v-show="modelBox" class="px-6 pb-6">
      <v-item label="Model Name">
        <Input
          @change="formData.nameError = false"
          :class="{ 'border-red-500': formData.nameError }"
          type="text"
          placeholder="Enter Model Name"
          v-model:model-value="formData.name"
        />
      </v-item>
      <v-item label="Model Type">
        <v-select
          @update:open="formData.typeError = false"
          :class="{ 'border-red-500': formData.typeError }"
          v-model:model-value="formData.type"
          placeholder="Select Model Type"
        >
          <SelectItem v-for="(e, i) in typeLis" :key="i" :value="e.value">{{ e.label }}</SelectItem>
        </v-select>
      </v-item>
      <Button class="w-full mt-3" @click="nextStep">Next Step</Button>
    </div>
    <vCustomAccordion :multiple="true" :activeIndex="acActiveIndex">
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
            <span v-else>Add Version</span>
            <Trash2
              v-if="formData.versions.length !== 1"
              class="w-4 h-4"
              #icon
              @click.capture.stop="delVersion(i)"
            />
            <Progress
              v-if="e.progress && acActiveIndex && acActiveIndex !== i"
              :model-value="e.progress"
              class="absolute w-full bottom-0 left-0 h-1"
            />
          </div>
        </template>
        <template #default>
          <div class="bg-[#353535] px-6 pb-4">
            <v-item label="Version Name">
              <Input
                @change="e.versionError = false"
                :class="{ 'border-red-500': e.versionError }"
                type="text"
                placeholder="Version Name"
                v-model:model-value="e.version"
              />
            </v-item>
            <v-item label="Base Model">
              <v-select
                @update:open="e.baseModelError = false"
                :class="{ 'border-red-500': e.baseModelError }"
                v-model:model-value="e.base_model"
                placeholder="Select Base Model"
              >
                <SelectItem v-for="(e, i) in baseTypeLis" :key="i" :value="e.value">{{
                  e.label
                }}</SelectItem>
              </v-select>
            </v-item>
            <v-item label="Introduction">
              <Markdown v-model.modelValue="e.intro" :editorId="`myeditor${i}`" />
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
                <Label for="airplane-mode">Publicly Visible</Label>
              </div>
            </v-item>
            <v-item label="File" v-show="!e.showUpload">
              <div class="flex h-28 items-center justify-end relative">
                <p v-if="e.progress && e.fileName" class="absolute top-2 left-1 text-xs">
                  {{ e.fileName }}
                </p>
                <div v-if="e.progress" class="flex-1">
                  <Progress :model-value="e.progress" class="mt-4 h-3" />
                  <p class="text-center pt-2">
                    {{ e.progress }}% Uploaded
                    <span class="pl-2" v-if="e.speed">Speed: {{ e.speed }}</span>
                  </p>
                </div>
                <vUpload
                  :parallel="1"
                  :ref="e.ref"
                  :chunkSize="1"
                  :class="{ 'border-red-500': e.filePathError }"
                  @path="path => handlePath(path, i)"
                  @start="() => startUpload(i)"
                  @success="data => successUpload(data, i)"
                  @error="() => errorUpload(i)"
                  @uploadInfo="data => handleUploadInfo(data, i)"
                  @progress="p => fnProgress(p, i)"
                />
              </div>
            </v-item>
          </div>
        </template>
      </vCustomAccordionItem>
    </vCustomAccordion>
    <template #foot v-if="!modelBox">
      <div
        class="bg-[#353535] px-6 w-full h-14 rounded-tl-lg rounded-tr-lg custom-shadow border-t-[1px] flex justify-between items-center -mt-4"
      >
        <Button variant="outline" class="" @click="addVersions">Add Version</Button>
        <Button :disabled="disabledPublish" @click="submit">Publish</Button>
      </div>
    </template>
    <div v-if="showLayoutLoading" class="z-50 w-full h-full absolute left-0 top-0"></div>
  </v-dialog>
</template>
<script setup lang="ts">
  import { useToaster } from '@/components/modules/toats/index'
  import { computed, ref, watch } from 'vue'
  // import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
  import { SelectItem } from '@/components/ui/select'
  import { Input } from '@/components/ui/input'
  import { Button } from '@/components/ui/button'
  import { Label } from '@/components/ui/label'
  import { Switch } from '@/components/ui/switch'
  import { Progress } from '@/components/ui/progress'
  import vDialog from '@/components/modules/vDialog.vue'
  import vSelect from '@/components/modules/vSelect.vue'
  import vItem from '@/components/modules/vItem.vue'
  // import vAccordionTrigger from '@/components/modules/vAccordionTrigger.vue'
  import vCustomAccordion from '@/components/modules/vCustomAccordion.vue'
  import vCustomAccordionItem from '@/components/modules/vCustomAccordionItem.vue'
  import vUpload from './upload.vue'
  import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
  // import { useShadet } from '@/components/modules/vShadet/index'

  import { useStatusStore } from '@/stores/userStatus'
  import { modelStore } from '@/stores/modelStatus'
  import Markdown from '@/components/markdown/Index2.vue'
  // checkLocalFile, submitUpload, interrupt_upload
  import { create_models, model_types, base_model_types, put_model } from '@/api/model'
  import { onMounted } from 'vue'
  import { Trash2 } from 'lucide-vue-next'

  const statusStore = useStatusStore()
  const modelStoreObject = modelStore()
  const modelBox = ref(true)
  // const versionIndex = ref(0);
  const typeLis = ref([{ value: '', label: '' }])
  const baseTypeLis = ref([{ value: '', label: '' }])
  const formData = ref({ ...modelStoreObject.modelDetail })
  const acActiveIndex = ref(-1)
  const showLayoutLoading = ref(false)

  const handleToggle = (i: number) => {
    acActiveIndex.value = i
    if (modelBox.value) {
      modelBox.value = false
    }
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
  let calculating: { close: any }
  // async function checkFile(val: string, index: number) {
  //   const res = await checkLocalFile({ absolute_path: val })
  //   formData.value.versions[index].file_upload_id = res.data.upload_id
  //   formData.value.versions[index].filePathError = false
  //   versionIndex.value = index
  //   await submitUpload({ upload_id: res.data.upload_id })
  //   asdasd = new Date().getTime()
  //   formData.value.versions[index].progress = 0.1
  //   calculating = useShadet({
  //     content: 'Start calculating the file hash',
  //     z: 'z-12000'
  //   })

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
    if (!formData.value.type) {
      useToaster.error('Please select the model type')
      formData.value.typeError = true
      return
    }
    if (formData.value.versions.length) {
      acActiveIndex.value = 0
      modelBox.value = false
    } else {
      addVersions()
    }
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
      if (!e.sign) {
        e.filePathError = true
        useToaster.error(`Please enter the file path for version ${i + 1}`)
        acActiveIndex.value = i
        break
      }
    }
    return tempData.versions.every((e: any) => e.version && e.base_model && e.sign)
  }

  // async function interrupt ({ file_upload_id }: any) {

  //   await interrupt_upload({ upload_id: file_upload_id })

  // }
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
  async function submit() {
    if (!verifyVersion()) {
      return
    }
    showLayoutLoading.value = true
    setTimeout(() => {
      showLayoutLoading.value = false
    }, 5000)
    const tempData = { ...formData.value }
    tempData.versions.forEach((e: any) => {
      delete e.baseModelError
      delete e.filePath
      delete e.filePathError
      delete e.versionError
      delete e.speed
      delete e.fileName
    })
    if (tempData.id) {
      await put_model(tempData)
    } else {
      await create_models(tempData)
    }
    useToaster.success('Model published successfully')

    onDialogClose()
  }

  // const acActiveFn = () => {
  //   if (modelBox.value) {
  //     modelBox.value = false
  //   }
  // }
  const onDialogClose = () => {
    modelStoreObject.setDialogStatus(false, 0)
    modelStoreObject.clearModelDetail()
    modelBox.value = true
    showLayoutLoading.value = false
    modelStoreObject.uploadModelDone()
  }
  watch(
    () => statusStore.socketMessage,
    (val: any) => {
      if (val.type == 'progress') {
        const i = formData.value.versions.findIndex(
          (e: any) => e.file_upload_id == val.data.upload_id
        )
        formData.value.versions[i].progress = Number(val.data.progress.replace('%', ''))
      }
      if (val.type == 'status' && val.data.status == 'finish') {
        const i = formData.value.versions.findIndex(
          (e: any) => e.file_upload_id == val.data.upload_id
        )
        if (formData.value.versions[i]) {
          formData.value.versions[i].path = val.data.model_files[0].path
          formData.value.versions[i].sign = val.data.model_files[0].sign
        }
      }
      if (val.type == 'interrupted') {
        useToaster.success('Upload interrupted')
        const i = formData.value.versions.findIndex(
          (e: any) => e.file_upload_id == val.data.upload_id
        )
        delete formData.value.versions[i].progress
        formData.value.versions[i].filePath = ''
      }
      if (val.type == 'error') {
        useToaster.error(val.data.message)
        const i = formData.value.versions.findIndex(
          (e: any) => e.file_upload_id == val.data.upload_id
        )
        delete formData.value.versions[i].progress
        formData.value.versions[i].filePath = ''
      }
      if (val.type == 'prepared') {
        calculating.close()
      }
      if (val.type === 'errors' && val.data && val.data.code === 500101) {
        calculating.close()
        useToaster.error(val.data.message)
        const i = formData.value.versions.findIndex(
          (e: any) => e.file_upload_id == val.data.data.upload_id
        )
        if (formData.value.versions[i].progress) {
          delete formData.value.versions[i].progress
        }
        formData.value.versions[i].filePath = ''
      }
    },
    {
      deep: true
    }
  )
  watch(
    () => modelStoreObject.modelDetail,
    (val: any) => {
      formData.value = val
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
  onMounted(async () => {
    const mt = await model_types()
    typeLis.value = mt.data
    const bmt = await base_model_types()
    baseTypeLis.value = bmt.data
  })
</script>
<style scoped></style>
