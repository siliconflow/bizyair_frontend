<template>
  <div :class="{ 'w-full': !disableUpload }">
    <div
      :class="[
        'hover:border-[hsl(var(--primary))] border-dashed border-2 border-[#9CA3AF] rounded-lg p-4 w-full border-box relative file-box',
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
      <p class="text-[rgba(156, 163, 175, 1)] text-center">{{ uploadText }}</p>
      <input
        :accept="ALLOW_UPLOADABLE_EXT_NAMES"
        class="cursor-pointer opacity-0 w-full h-full absolute left-0 top-0"
        type="file"
        @change="handleFileChange"
      />
    </div>
    <div v-if="disableUpload" class="pl-2">
      <Button class="" @click="interrupt()" v-if="!uploadSuccessful">interrupt</Button>
      <Button class="" @click="interrupt()" v-else>cancel</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useToaster } from '@/components/modules/toats/index'
  import { ref } from 'vue'
  import { useShadet } from '@/components/modules/vShadet/index'
  import { Button } from '@/components/ui/button'
  import { commit_file } from '@/api/model'
  import { creatClient } from './ossClient'
  
  const props = defineProps({
    modelType: String
  })

  let calculatingDialog: any
  const uploadText = ref('Click or drag file to this area to upload')
  const disableUpload = ref(false)
  const ALLOW_UPLOADABLE_EXT_NAMES = ref('.safetensors, .pth, .bin, .pt, .ckpt, .gguf, .sft')

  const isHighlighted = ref(false)
  const uploadSuccessful = ref(false)

  function preventDefaults(e: Event) {
    e.preventDefault()
    e.stopPropagation()
  }

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
    if (files) {
      uploadFile(files[0])
    }
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (files) {
      uploadFile(files[0])
    }
  }
  const emit = defineEmits(['progress', 'path', 'start', 'uploadInfo', 'success', 'error'])
  const progress = ref(0)
  const onProgress = (p: number) => {
    progress.value = p || 0.0001
    emit('progress', Number((progress.value * 100).toFixed(2)))
  }
  interface doUploadData {
    client: any
    file: File
    objectKey: any
    retryLimit?: number
    md5Hash?: string
    sha256sum?: string
  }
  async function doUpload(data: doUploadData) {
    const { client, file, objectKey, retryLimit = 3 } = data
    let lastUploadedSize = 0
    let lastTime = performance.now()
    try {
      const completeResult = await client.multipartUpload(objectKey, file, {
        progress: (p: any) => {
          onProgress(p)
          let speed: string = ''
          const now = performance.now()
          const uploadedSize = file.size * p
          const deltaSize = uploadedSize - lastUploadedSize
          const deltaTime = (now - lastTime) / 1000
          if (deltaTime > 0) {
            const speedInBytes = deltaSize / deltaTime
            if (speedInBytes >= 1024 * 1024) {
              speed = `${(speedInBytes / (1024 * 1024)).toFixed(2)} MB/s`
            } else {
              speed = `${(speedInBytes / 1024).toFixed(2)} KB/s`
            }
          }
          lastUploadedSize = uploadedSize
          lastTime = now
          emit('uploadInfo', {
            speed,
            fileName: file.name
          })
        },
        parallel: 2,
        partSize: 5 * 1024 * 1024
      })
      return completeResult
    } catch (e: any) {
      console.error(e)
      if (e.name === 'cancel') {
        return e
      }
      if (retryLimit <= 0) {
        throw e
      } else {
        return await doUpload({
          client,
          file,
          objectKey,
          retryLimit: retryLimit - 1
        })
      }
    }
  }
  let client: any = null

  const interrupt = async () => {
    await client?.cancel()
    disableUpload.value = false
    uploadSuccessful.value = false
    uploadText.value = 'Click or drag file to this area to upload'
    emit('progress', '')
  }
  
  async function uploadFile(file: File) {
    uploadText.value = file.name
    const fileExtension = file.name.split('.').pop()
    if (fileExtension && ALLOW_UPLOADABLE_EXT_NAMES.value.search(fileExtension) === -1) {
      useToaster.error('Invalid file format.')
      return
    }
    emit('path', file.name)
    disableUpload.value = true
    calculatingDialog = useShadet({
      content: 'In hash calculation',
      z: 'z-12000'
    })
    const { oss, objectKey, md5Hash, sha256sum, fileId } = await creatClient(file)
    calculatingDialog.close()
    if (fileId) {
      emit('success', { sha256sum, path: file.name })
      emit('uploadInfo', {
        fileName: file.name
      })
      emit('progress', 100)
      uploadSuccessful.value = true
      // disableUpload.value = false
      return
    }

    client = oss
    emit('start')
    const result = await doUpload({
      client,
      file,
      objectKey,
      md5Hash,
      sha256sum
    })
    if (result.status === 0) {
      return Promise.reject('')
    } else if (result.res.status === 200) {
      await commit_file({
        md5_hash: md5Hash,
        md5Hash,
        sha256sum,
        object_key: objectKey,
        type: props.modelType,
      })
      // disableUpload.value = false
      emit('success', { sha256sum, object_key: objectKey })
      uploadSuccessful.value = true
      emit('uploadInfo', {
        fileName: file.name,
        speed: ''
      })
      return result.res
    } else {
      emit('error')
      disableUpload.value = false
      uploadSuccessful.value = true
      emit('progress', '')
      throw new Error(`Upload to OSS failed: ${result.res.statusText}`)
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
