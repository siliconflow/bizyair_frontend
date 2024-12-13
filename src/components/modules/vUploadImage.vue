<script setup lang="ts">
import { ref } from 'vue'
import vImage from '@/components/modules/vImage.vue'
import { Trash2 } from 'lucide-vue-next';

const imageSrc = ref('')

function base64ToFile(base64: string, filename: string, mimeType: any) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType || base64.split(':')[1].split(';')[0] });
  return new File([blob], filename, { type: blob.type });
}
const formatToWebp = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const webpDataUrl = canvas.toDataURL('image/webp')
      imageSrc.value = webpDataUrl
      console.log(base64ToFile(webpDataUrl, `${file.name}.webp`, 'image/webp'))
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files) {
    formatToWebp(files[0])
    imageSrc.value = URL.createObjectURL(files[0])
    console.log(URL.createObjectURL(files[0]))
  }
}
</script>

<template>
  <div class="w-32 h-32 border border-dashed border-slate-300 rounded-lg relative overflow-hidden">
    <input class="cursor-pointer opacity-0 w-full h-full absolute left-0 top-0 z-20" type="file"
      @change="handleFileChange" />
    <vImage :src="imageSrc" class="block object-cover w-32 h-32 rounded-lg absolute left-0 top-0 z-10" />
    <div class="w-20 h-1 absolute left-6 top-1/2 -translate-y-1/2 bg-slate-400 rounded-md"></div>
    <div class="w-1 h-20 absolute top-6 left-1/2 -translate-x-1/2 bg-slate-400 rounded-md"></div>
    <Trash2 class="absolute right-2 top-2 z-30 cursor-pointer" v-if="imageSrc" @click="imageSrc = ''" />
  </div>
</template>