<template>
  <div
    class="flex items-center hover:bg-[#4A238E] cursor-pointer relative px-3"
    @click="modelStoreObject.setDialogStatus(true)"
  >
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.44255 10.6667L10.7759 12L13.4425 9.33335M12.7759 6.66668V5.33335C12.7756 5.09953 12.7139 4.86989 12.5969 4.66746C12.4799 4.46503 12.3117 4.29692 12.1092 4.18002L7.44255 1.51335C7.23985 1.39633 7.00993 1.33472 6.77588 1.33472C6.54183 1.33472 6.3119 1.39633 6.10921 1.51335L1.44255 4.18002C1.24005 4.29692 1.07187 4.46503 0.954853 4.66746C0.837841 4.86989 0.776119 5.09953 0.775879 5.33335V10.6667C0.776119 10.9005 0.837841 11.1301 0.954853 11.3326C1.07187 11.535 1.24005 11.7031 1.44255 11.82L6.10921 14.4867C6.3119 14.6037 6.54183 14.6653 6.77588 14.6653C7.00993 14.6653 7.23985 14.6037 7.44255 14.4867L8.77588 13.7267M9.77588 6.26668L3.80921 2.82668M0.969212 4.66668L6.77588 8.00002M6.77588 8.00002L12.5825 4.66668M6.77588 8.00002V14.6667"
        stroke="#F9FAFB"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span class="block leading h-full leading-8 text-sm">{{ t('buttons.publishModel') }}</span>
  </div>
  <v-dialog
    v-if="modelStoreObject.showDialog"
    v-model:open="modelStoreObject.showDialog"
    class="px-0 overflow-hidden pb-0 z-9000"
    layout-class="z-9000"
    content-class="custom-scrollbar max-h-[80vh] overflow-y-auto w-full rounded-tl-lg rounded-tr-lg custom-shadow"
    @on-close="onDialogClose"
  >
    <template #title
      ><span class="px-6 cursor-pointer" @click="handleToggleTitle">{{
        t('publish.model.title')
      }}</span></template
    >
    <div v-show="modelBox" class="px-6 pb-6">
      <v-item :label="t('publish.model.name.label')">
        <Input
          v-model:model-value="formData.name"
          :class="{ 'border-red-500': formData.nameError }"
          type="text"
          :placeholder="t('publish.model.name.placeholder')"
          @change="formData.nameError = false"
        />
      </v-item>
      <v-item :label="t('publish.model.type.label')">
        <v-select
          v-model:model-value="formData.type"
          :class="{ 'border-red-500': formData.typeError }"
          :placeholder="t('publish.model.type.placeholder')"
          @update:open="formData.typeError = false"
        >
          <SelectItem v-for="(e, i) in filteredTypeLis" :key="i" :value="e.value">{{
            e.label
          }}</SelectItem>
        </v-select>
      </v-item>
      <Button class="w-full mt-3" @click="nextStep">{{ t('publish.model.nextStep') }}</Button>
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
            <span v-else>{{ t('publish.model.addVersion') }}</span>
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
            <v-item :label="t('publish.model.version.name')">
              <Input
                v-model:model-value="e.version"
                :class="{ 'border-red-500': e.versionError }"
                type="text"
                :placeholder="t('publish.model.version.placeholder')"
                @change="e.versionError = false"
              />
            </v-item>
            <v-item :label="t('publish.model.baseModel')">
              <v-select
                v-model:model-value="e.base_model"
                :class="{ 'border-red-500': e.baseModelError }"
                :placeholder="t('publish.model.baseModelPlaceholder')"
                @update:open="e.baseModelError = false"
              >
                <SelectItem
                  v-for="(item, index) in filteredBaseTypeLis"
                  :key="index"
                  :value="item.value"
                  >{{ item.value }}</SelectItem
                >
              </v-select>
            </v-item>
            <v-item :label="t('publish.model.uploadImage')">
              <vUploadImage v-model.modelValue="e.cover_urls" />{{ e.cover_urls }}
            </v-item>
            <v-item :label="t('publish.model.introduction')">
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
                <Label for="airplane-mode">{{ t('publish.model.publicVisible') }}</Label>
              </div>
            </v-item>
            <v-item v-show="!e.showUpload" :label="t('publish.model.file')">
              <div class="flex h-28 items-center justify-end relative">
                <p v-if="e.progress && e.fileName" class="absolute top-2 left-1 text-xs">
                  {{ e.fileName }}
                </p>
                <div v-if="e.progress" class="flex-1">
                  <Progress :model-value="e.progress" class="mt-4 h-3" />
                  <p class="text-center pt-2">
                    {{ e.progress }}% {{ t('publish.model.uploaded') }}
                    <span v-if="e.speed" class="pl-2"
                      >{{ t('publish.model.speed') }}: {{ e.speed }}</span
                    >
                  </p>
                </div>
                <vUpload
                  :ref="e.ref"
                  :model-type="formData.type"
                  :class="{ 'border-red-500': e.filePathError }"
                  @path="path => handlePath(path, i)"
                  @start="() => startUpload(i)"
                  @success="data => successUpload(data, i)"
                  @error="() => errorUpload(i)"
                  @upload-info="data => handleUploadInfo(data, i)"
                  @progress="p => fnProgress(p, i)"
                />
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
          t('publish.model.addVersion')
        }}</Button>
        <Button :disabled="disabledPublish" @click="submit">{{
          t('publish.model.publish')
        }}</Button>
      </div>
    </template>
    <div v-if="showLayoutLoading" class="z-50 w-full h-full absolute left-0 top-0"></div>
  </v-dialog>
</template>
<script setup lang="ts">
  import { useToaster } from '@/components/modules/toats/index'
  import { computed, ref, watch, onMounted } from 'vue'
  import { SelectItem } from '@/components/ui/select'
  import { Input } from '@/components/ui/input'
  import { Button } from '@/components/ui/button'
  import { Label } from '@/components/ui/label'
  import { Switch } from '@/components/ui/switch'
  import { Progress } from '@/components/ui/progress'
  import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
  import { modelStore } from '@/stores/modelStatus'
  import { create_models, model_types, get_all_dict, put_model } from '@/api/model'
  import { Trash2 } from 'lucide-vue-next'
  import vDialog from '@/components/modules/vDialog.vue'
  import vSelect from '@/components/modules/vSelect.vue'
  import vItem from '@/components/modules/vItem.vue'
  import vCustomAccordion from '@/components/modules/vCustomAccordion.vue'
  import vCustomAccordionItem from '@/components/modules/vCustomAccordionItem.vue'
  import vUpload from '@/components/modules/vUpload/index.vue'
  import vUploadImage from '@/components/modules/vUpload/vUploadImage.vue'
  import Markdown from '@/components/markdown/Index.vue'
  import { useI18n } from 'vue-i18n'
  import type { CommonModelType } from '@/types/model'

  const { t } = useI18n()
  const modelStoreObject = modelStore()
  const modelBox = ref(true)
  const typeLis = ref<CommonModelType[]>([])
  const baseTypeLis = ref<CommonModelType[]>([])
  const filteredTypeLis = computed<CommonModelType[]>(() =>
    typeLis.value.filter((o: CommonModelType | undefined) => !!o && !!o.value)
  )
  const filteredBaseTypeLis = computed<CommonModelType[]>(() =>
    baseTypeLis.value.filter((o: CommonModelType | undefined) => !!o && !!o.value)
  )
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
      title: t('publish.model.confirmDelete.title'),
      desc: t('publish.model.confirmDelete.desc'),
      cancel: t('publish.model.confirmDelete.cancel'),
      continue: t('publish.model.confirmDelete.continue'),
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
      useToaster.error(t('publish.model.errors.enterName'))
      formData.value.nameError = true
      return
    }
    if (!formData.value.type) {
      useToaster.error(t('publish.model.errors.selectType'))
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
        useToaster.error(t('publish.model.errors.enterVersion', { index: i + 1 }))
        acActiveIndex.value = i
        break
      }
      if (!e.base_model) {
        e.baseModelError = true
        useToaster.error(t('publish.model.errors.selectBaseModel', { index: i + 1 }))
        acActiveIndex.value = i
        break
      }
      if (!e.sign) {
        e.filePathError = true
        useToaster.error(t('publish.model.errors.enterFilePath', { index: i + 1 }))
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
  const onDialogClose = () => {
    modelStoreObject.setDialogStatus(false, 0)
    modelStoreObject.clearModelDetail()
    modelBox.value = true
    showLayoutLoading.value = false
    modelStoreObject.uploadModelDone()
  }
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
    const bmt = await get_all_dict()
    baseTypeLis.value = bmt.data.base_models
  })
</script>
<style scoped></style>
