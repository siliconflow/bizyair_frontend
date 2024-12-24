<script setup lang="ts">
import { ref } from 'vue'
import vImage from '@/components/modules/vImage.vue'
import { Trash2 } from 'lucide-vue-next';
import { formatToWebp, imageToOss } from './imageToOss'
import { calculateHash } from './computeHash'
  import { commit_file } from '@/api/model'
const imageSrc = ref('')
const fileInput = ref<any>()
const emit = defineEmits(['update:modelValue'])



const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files) {
    imageSrc.value = URL.createObjectURL(files[0])
    emit('update:modelValue', imageSrc.value)
    const { file } = await formatToWebp(files[0])
    const { url, ossTokenFile } = await imageToOss(file)
    const { sha256sum, md5Hash } = await calculateHash(file)
    console.log(md5Hash, sha256sum, ossTokenFile.object_key)
    await commit_file({
      md5_hash: md5Hash,
      md5Hash,
      sha256sum,
      object_key: ossTokenFile.object_key,
      type: 'image',
    })
    imageSrc.value = url
    emit('update:modelValue', imageSrc.value)
  }
}
const clearVal = () => {
  imageSrc.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="w-32 h-32 border border-dashed border-slate-300 rounded-lg relative overflow-hidden">
    <input ref="fileInput" class="cursor-pointer opacity-0 w-full h-full absolute left-0 top-0 z-20" type="file"
      @change="handleFileChange" />
    <vImage :src="imageSrc" class="block object-cover w-32 h-32 rounded-lg absolute left-0 top-0 z-10" />
    <div class="w-20 h-1 absolute left-6 top-1/2 -translate-y-1/2 bg-slate-400 rounded-md"></div>
    <div class="w-1 h-20 absolute top-6 left-1/2 -translate-x-1/2 bg-slate-400 rounded-md"></div>
    <Trash2 class="absolute right-2 top-2 z-30 cursor-pointer" v-if="imageSrc" @click="clearVal" />
  </div>
</template>