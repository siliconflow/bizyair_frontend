<script setup lang="ts">
import { NProgress, NTooltip } from 'naive-ui'
import { ref } from 'vue';


interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  filesystem: any;
}

interface FileSystemDirectoryReader {
  readEntries: (successCallback: (entries: FileSystemEntry[]) => void, errorCallback?: (error: DOMException) => void) => void;
}

interface FileSystemDirectoryEntry extends FileSystemEntry {
  createReader: () => FileSystemDirectoryReader;
}

interface FileSystemFileEntry extends FileSystemEntry {
  file: (successCallback: (file: File) => void, errorCallback?: (error: DOMException) => void) => void;
}


const files = ref<File[]>([])
const uploadedNumber = ref(0)
const isHighlighted = ref(false)

const uploadFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  console.log(formData)
}
const changeFiles = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target?.files) {
    files.value = Array.from(target.files);
    console.log(files.value);
    uploadFile(files.value[0]);
  }
}

// const preventDefaults = (e: Event) => {
//   e.preventDefault()
//   e.stopPropagation()
// }

// const highlight = (e: DragEvent) => {
//   preventDefaults(e)
//   isHighlighted.value = true
// }

// const unhighlight = (e: DragEvent) => {
//   preventDefaults(e)
//   isHighlighted.value = false
// }

// const handleDrop = (e: DragEvent) => {
//   preventDefaults(e)
//   unhighlight(e)
  
//   const items = e.dataTransfer?.items;
//   if (items) {
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       if (item.kind === 'file') {
//         const entry = item.webkitGetAsEntry();
//         if (entry) {
//           if (entry.isDirectory) {
//             if (entry.isDirectory) {
//               readDirectory(entry as unknown as FileSystemDirectoryEntry);
//             }
//           } else {
//             (entry as unknown as FileSystemFileEntry).file((file) => {
//               files.value.push(file);
//             });
//           }
//         }
//       }
//     }
//   }
// }

// const readDirectory = (directoryEntry: FileSystemDirectoryEntry) => {
//   const reader = directoryEntry.createReader();
//   reader.readEntries((entries) => {
//     entries.forEach((entry) => {
//       if (entry.isDirectory) {
//         readDirectory(entry as FileSystemDirectoryEntry);
//       } else {
//         (entry as FileSystemFileEntry).file((file) => {
//           console.log(file);
//           files.value.push(file);
//         });
//       }
//     });
//   }, (error) => {
//     console.error('Error reading directory:', error);
//   });
// };

</script>

<template>
  <div class="v-upload-multi">
    <div 
      class="v-upload-input">
      <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor"><path d="M11.57 21h-1.063c-4.01 0-6.015 0-7.261-1.546S2 15.42 2 10.444V7.22c0-1.917 0-2.876.324-3.595a2.94 2.94 0 0 1 .984-1.223C3.888 2 4.661 2 6.206 2c.99 0 1.485 0 1.918.202c.99.46 1.398 1.575 1.844 2.683l.539 1.337m-3.503 0h8.545c1.792 0 2.688 0 3.332.534c.278.23.518.528.704.874c.29.538.384 1.219.415 2.287"/><path d="M4.596 12.576c.43-1.15.647-1.724 1.067-2.085c.68-.582 1.657-.485 2.494-.485h9.095c2.477 0 3.716 0 4.334.797c1.06 1.368-.191 3.587-.695 4.93c-.904 2.408-1.356 3.612-2.256 4.346c-1.371 1.119-3.366.904-5.021.904H9.937c-3.543 0-5.314 0-6.236-1.096c-1.7-2.025.13-5.274.895-7.312"/></g></svg></span>
      <span class="word">Drag 'n' drop some files here, or click to select files</span>
      <input webkitdirectory type="file" @change="changeFiles" />
    </div>
    <div class="v-upload-progress">
      <p>
        <span>Overall Progress</span>
        <span>{{ uploadedNumber }}/{{ files.length }}</span>
      </p>
      <n-progress
        type="line"
        :show-indicator="false"
        color="#6D28D9"
        :percentage="20"
      />
    </div>
    <ul class="v-upload-list custom-scrollbar">
      <li v-for="(e, i) in files" :key="i">
        <div class="v-upload-list-item">
          <n-tooltip trigger="hover" placement="top-start">
            <template #trigger>
              <span>{{ e.name }}</span>
            </template>
            {{ e.name }}
          </n-tooltip>
          <n-progress
            type="line"
            :show-indicator="false"
            color="#6D28D9"
            :percentage="20"
            class="progress"
          />
        </div>
        <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg></span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">
.v-upload-multi{
  width: 100%;
}
.v-upload-input{
  width: 100%;
  height: 124px;
  background-color: rgba(34, 34, 34, 1);
  overflow: hidden;
  border-radius: 8px;
  position: relative;
  .icon{
    display: block;
    margin: 32px auto 0;
    width: 28px;
    height: 28px;
    svg{
      width: 28px;
      height: 28px;
    }
  }
  .word{
    text-align: center;
    width: 100%;
    display: block;
    line-height: 30px;
  }
  input{
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
  }
}
.v-upload-progress{
  width: 100%;
  padding: 16px 0;
  p{
    display: flex;
    justify-content: space-between;
    span{
      display: block;
    }
  }
}
.v-upload-list{
  padding: 0 20px;
  width: 100%;
  height: 224px;
  box-sizing: border-box;
  background-color: rgba(34, 34, 34, 1);
  overflow-y: auto;
  border-radius: 8px;
  li{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    width: 100%;
    border-bottom: 1px solid rgba(0, 0, 0, 1);
    .v-upload-list-item{
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 8px 0;
      gap: 8px;
      span{
        display: block;
        width: 50%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .progress{
        width: 50%;
      }
    }
    .icon{
      display: block;
      width: 24px;
      height: 24px;
      margin-left: 20px;
      cursor: pointer;
    }
    svg{
      width: 24px;
      height: 24px;
    }
  }
}
</style>