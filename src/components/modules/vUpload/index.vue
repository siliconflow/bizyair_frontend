<template>
  <div :class="{ 'w-full': !disableUpload }">
    <div
      :class="[
        'hover:border-[hsl(var(--primary))] border-dashed border-2 border-[#9CA3AF] rounded-lg p-4 border-box relative file-box',
        { 'border-[hsl(var(--primary))]': isHighlighted },
        { hidden: disableUpload }
      ]"
      @dragenter="highlight"
      @dragover="highlight"
      @dragleave="unhighlight"
      @drop="handleDrop"
    >
      <div class="w-11 h-11 mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="44"
          height="43"
          viewBox="0 0 44 43"
          fill="none"
        >
          <path
            d="M38.125 26.875V34.0417C38.125 34.992 37.7475 35.9035 37.0755 36.5755C36.4035 37.2475 35.492 37.625 34.5417 37.625H9.45833C8.50797 37.625 7.59654 37.2475 6.92453 36.5755C6.25253 35.9035 5.875 34.992 5.875 34.0417V26.875M30.9583 14.3333L22 5.375M22 5.375L13.0417 14.3333M22 5.375V26.875"
            stroke="#9CA3AF"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <p class="text-[rgba(156, 163, 175, 1)] text-center">
        {{ $t('vUpload.clickOrDrag') }}
      </p>
      <input
        :accept="allowedExtensions"
        class="cursor-pointer opacity-0 w-full h-full absolute left-0 top-0"
        type="file"
        ref="fileInput"
        @change="handleFileChange"
      />
    </div>
    <div v-if="disableUpload" class="pl-2">
      <n-button type="primary" @click="interrupt()" v-if="!uploadSuccessful">{{
        $t('vUpload.interrupt')
      }}</n-button>
      <n-button type="primary" @click="cancel()" v-else>{{ $t('vUpload.cancel') }}</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watchEffect } from 'vue'
  import { NButton } from 'naive-ui'
  import { DEFAULT_ALLOWED_EXTENSIONS } from './constants'
  import { UploadProps } from './types'
  import { preventDefaults } from './utils'
  import { useUpload } from './useUpload'

  const props = defineProps<UploadProps>()
  const fileInput = ref<HTMLInputElement | null>(null)
  const isHighlighted = ref(false)
  const emit = defineEmits(['progress', 'path', 'start', 'uploadInfo', 'success', 'error'])
  const allowedExtensions = computed(() => props.accept || DEFAULT_ALLOWED_EXTENSIONS)
  const { disableUpload, uploadSuccessful, uploadFile, interrupt, cancel } = useUpload(
    computed(() => props.modelType),
    (event: string, payload?: any) => {
      emit(event as 'error' | 'progress' | 'uploadInfo' | 'success' | 'path' | 'start', payload)
    }
  )

  // 当传入fileName时，设置为已上传完成状态
  watchEffect(() => {
    if (props.fileName) {
      disableUpload.value = true
      uploadSuccessful.value = true
      emit('progress', 100)
      emit('uploadInfo', {
        fileName: props.fileName,
        status: 'complete'
      })
    }
  })

  function highlight(e: DragEvent) {
    preventDefaults(e)
    isHighlighted.value = true
  }

  function unhighlight(e: DragEvent) {
    preventDefaults(e)
    isHighlighted.value = false
  }

  function handleDrop(e: DragEvent) {
    preventDefaults(e)
    unhighlight(e)
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
      uploadFile(files[0])
      if (!disableUpload.value) {
        target.value = ''
      }
    }
  }
</script>

<style scoped>
  .file-box:hover p {
    color: hsl(var(--primary));
  }

  .file-box:hover svg path {
    stroke: hsl(var(--primary));
  }
</style>
