<script setup lang="ts">
  import { useModelSelectStore } from '@/stores/modelSelectStore'
  import vDialog from '@/components/modules/vDialog.vue'
  import Mine from '@/components/model-select/Mine.vue'
  import { onMounted } from 'vue'
  import type { ModelVersion, Model } from '@/types/model'
  import { watch } from 'vue'
  import LoadingOverlay from '@/components/community/modules/LoadingOverlay.vue'
  const modelSelectStore = useModelSelectStore()

  interface Props {
    modelType?: string[]
    selectedBaseModels?: string[]
  }
  const props = defineProps<Props>()
  const emit = defineEmits(['apply', 'close'])

  watch(
    () => modelSelectStore.showDialog,
    newVal => {
      if (!newVal) {
        emit('close')
      }
    }
  )

  watch(
    () => modelSelectStore.applyObject,
    (newVal: { version: ModelVersion; model: Model }) => {
      if (newVal.version && newVal.model) {
        emit('apply', newVal.version, newVal.model.name)
      }
    },
    { deep: true }
  )

  watch(
    () => props.modelType,
    newModelType => {
      modelSelectStore.filterDataLoaded = false
      modelSelectStore.loadFilterData(newModelType, props.selectedBaseModels)
    },
    { deep: true, immediate: true }
  )

  watch(
    () => props.selectedBaseModels,
    newSelectedBaseModels => {
      modelSelectStore.filterDataLoaded = false
      modelSelectStore.loadFilterData(props.modelType, newSelectedBaseModels)
    },
    { deep: true, immediate: true }
  )

  onMounted(async () => {
    await modelSelectStore.loadFilterData(props.modelType, props.selectedBaseModels)
    modelSelectStore.showDialog = true
  })

  const handleClose = () => {
    modelSelectStore.showDialog = false
    emit('close')
  }
</script>

<template>
  <v-dialog
    v-model:open="modelSelectStore.showDialog"
    class="px-0 overflow-hidden pb-0 z-9000 max-w-[90%] bg-[#353535]"
    layout-class="z-9000"
    content-class="max-h-[80vh] w-full rounded-tl-lg rounded-tr-lg custom-shadow"
    @on-close="handleClose"
  >
    <div v-if="modelSelectStore.filterDataLoaded" class="flex w-full h-full overflow-hidden">
      <div class="flex-1 bg-[#353535] h-full">
        <Mine />
      </div>
    </div>
    <div v-else>
      <div class="flex justify-center items-center min-h-[70vh]">
        <LoadingOverlay />
      </div>
    </div>
  </v-dialog>
</template>
