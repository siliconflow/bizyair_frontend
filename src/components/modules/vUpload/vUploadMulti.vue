<script setup lang="ts">
import { NProgress, NTooltip } from 'naive-ui'
import { creatClient } from './ossClient'
import { commit_file } from '@/api/model'
import { computed, ref, watch } from 'vue'

interface UploadFile extends File {
  progress?: number
  sha256sum?: string
  path?: string
  client?: any
}

const emit = defineEmits(['update:value', 'isUploading', 'uploadDone'])

const isUploading = ref(false)
const fileList = ref<UploadFile[]>([])
const uploadQueue = ref<UploadFile[]>([])
const uploadedNumber = ref(0)
const uploadingFiles = ref<UploadFile[]>([])
const uploadList = ref<HTMLElement | null>(null)
const uploadFile = async (file: UploadFile) => {
  const { oss, objectKey, md5Hash, sha256sum, fileId } = await creatClient(
    file,
    'ComfyUI'
  )
  if (fileId) {
    file.progress = 100
    file.sha256sum = sha256sum
    file.path = file.name
  } else {
    file.client = oss
    const result = await oss?.multipartUpload(objectKey, file, {
      progress: (p: number) => {
        file.progress = p
      },
    })
    if (result && result.res && result.res.status === 200) {
      await commit_file({
        md5_hash: md5Hash,
        md5Hash,
        sha256sum,
        object_key: objectKey,
        type: 'DATASET',
      })
      emit('update:value', fileList.value)
    }
  }
  const index = uploadingFiles.value.indexOf(file)
  if (index !== -1) {
    uploadingFiles.value.splice(index, 1)
    uploadedNumber.value++ 
  }
  startUpload()
}

const scrollToFile = (file: UploadFile) => {
  const index = fileList.value.indexOf(file)
  if (index !== -1 && uploadList.value) {
    const listItem = uploadList.value.children[index] as HTMLElement
    if (listItem) {
      uploadList.value.scrollTo({
        top: listItem.offsetTop - 260,
      })
    }
  }
}

const startUpload = () => {
  while (uploadingFiles.value.length < 4 && uploadQueue.value.length > 0) {
    const file = uploadQueue.value.shift()
    if (file) {
      file.progress = 0
      uploadingFiles.value.push(file)
      uploadFile(file)
      scrollToFile(file)
    }
  }
}

const changeFiles = (e: Event) => {
  const target = e.target as HTMLInputElement
  console.log(target.files)
  if (target?.files) {
    const newFiles = Array.from(target.files)
    fileList.value.push(...newFiles)
    uploadQueue.value.push(...newFiles)
    startUpload()
  }
}

const cancelOss = (e: any, i: any) => {
  fileList.value.splice(i, 1)
  const index = uploadQueue.value.findIndex((file) => file === e)
  if (index !== -1) {
    uploadQueue.value.splice(index, 1)
  }
  if (e.progress == 100) {
    uploadedNumber.value --
  }
  e.client?.cancel()
  emit('update:value', fileList.value)
}

const uploadRatio = computed(() =>  uploadedNumber.value / fileList.value.length)
watch(uploadRatio, (val) => {
  if (val === 1) {
    emit('uploadDone')
    console.log('upload done')
  } else {
    emit('isUploading', true)
    console.log('uploading')
  }
})
watch(fileList, (val) => {
  if (val.length > 0) {
    isUploading.value = true
  } else {
    isUploading.value = false    
  }
}, { deep: true })
</script>

<template>
  <div class="v-upload-multi">
    <div v-show="!isUploading" class="v-upload-input">
      <span class="icon"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="96"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            color="currentColor"
          >
            <path
              d="M11.57 21h-1.063c-4.01 0-6.015 0-7.261-1.546S2 15.42 2 10.444V7.22c0-1.917 0-2.876.324-3.595a2.94 2.94 0 0 1 .984-1.223C3.888 2 4.661 2 6.206 2c.99 0 1.485 0 1.918.202c.99.46 1.398 1.575 1.844 2.683l.539 1.337m-3.503 0h8.545c1.792 0 2.688 0 3.332.534c.278.23.518.528.704.874c.29.538.384 1.219.415 2.287"
            />
            <path
              d="M4.596 12.576c.43-1.15.647-1.724 1.067-2.085c.68-.582 1.657-.485 2.494-.485h9.095c2.477 0 3.716 0 4.334.797c1.06 1.368-.191 3.587-.695 4.93c-.904 2.408-1.356 3.612-2.256 4.346c-1.371 1.119-3.366.904-5.021.904H9.937c-3.543 0-5.314 0-6.236-1.096c-1.7-2.025.13-5.274.895-7.312"
            />
          </g></svg
      ></span>
      <span class="word"
        >Drag 'n' drop some files here, or click to select files</span
      >
      <input webkitdirectory type="file" @change="changeFiles" />
    </div>
    <div v-show="isUploading" class="v-upload-progress">
      <p>
        <span>Overall Progress</span>
        <span>{{ uploadedNumber }}/{{ fileList.length }}</span>
      </p>
      <n-progress
        type="line"
        :show-indicator="false"
        color="#6D28D9"
        :percentage="(uploadedNumber / fileList.length) * 100"
      />
    </div>
    <ul v-show="isUploading" ref="uploadList" class="v-upload-list custom-scrollbar">
      <li v-for="(e, i) in fileList" :key="i">
        <div class="v-upload-list-item">
          <n-tooltip trigger="hover" placement="top-start">
            <template #trigger>
              <span>{{ e.webkitRelativePath }}</span>
            </template>
            {{ e.webkitRelativePath }}
          </n-tooltip>
          <n-progress
            type="line"
            :show-indicator="false"
            color="#6D28D9"
            :percentage="e.progress || 0"
            class="progress"
          />
        </div>
        <span class="icon" @click="cancelOss(e, i)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
            /></svg
        ></span>
      </li>
      <!-- <n-button type="primary" class="upload-clear" @click="clearAll">clear</n-button> -->
    </ul>
  </div>
</template>

<style scoped lang="less">
.v-upload-multi {
  width: 100%;
}
.v-upload-input {
  width: 100%;
  height: 124px;
  background-color: rgba(34, 34, 34, 1);
  overflow: hidden;
  border-radius: 8px;
  position: relative;
  .icon {
    display: block;
    margin: 32px auto 0;
    width: 28px;
    height: 28px;
    svg {
      width: 28px;
      height: 28px;
    }
  }
  .word {
    text-align: center;
    width: 100%;
    display: block;
    line-height: 30px;
  }
  input {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
  }
}
.v-upload-progress {
  width: 100%;
  padding: 16px 0;
  p {
    display: flex;
    justify-content: space-between;
    span {
      display: block;
    }
  }
}
.v-upload-list {
  padding: 0 20px;
  width: 100%;
  height: 224px;
  box-sizing: border-box;
  background-color: rgba(34, 34, 34, 1);
  overflow-y: auto;
  border-radius: 8px;
  position: relative;
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    width: 100%;
    border-bottom: 1px solid rgba(0, 0, 0, 1);
    .v-upload-list-item {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 8px 0;
      gap: 8px;
      span {
        display: block;
        width: 50%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .progress {
        width: 50%;
      }
    }
    .icon {
      display: block;
      width: 24px;
      height: 24px;
      margin-left: 20px;
      cursor: pointer;
    }
    svg {
      width: 24px;
      height: 24px;
    }
  }
}
</style>