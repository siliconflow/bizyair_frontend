<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import vImage from '@/components/modules/vImage.vue'
  import { Trash2 } from 'lucide-vue-next'
  import { formatToWebp, imageToOss } from './imageToOss'
  import { cn } from '@/lib/utils'
  const imageSrc = ref('')
  const fileInput = ref<any>()
  const emit = defineEmits(['update:modelValue', 'done', 'change'])

  const props = defineProps({
    previewPrc: String,
    className: String
  })

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    emit('change', files)
    if (files) {
      imageSrc.value = URL.createObjectURL(files[0])
      emit('update:modelValue', imageSrc.value)
      const { file } = await formatToWebp(files[0])
      const { url } = await imageToOss(file)
      imageSrc.value = url
      emit('update:modelValue', imageSrc.value)
      emit('done')
    }
  }
  const clearVal = () => {
    imageSrc.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  onMounted(() => {
    imageSrc.value = props.previewPrc as string
  })
</script>

<template>
  <div
    :class="
      cn(
        'w-32 h-32 border border-dashed border-slate-300 rounded-lg relative overflow-hidden',
        props.className
      )
    "
  >
    <input
      ref="fileInput"
      class="cursor-pointer opacity-0 w-full h-full absolute left-0 top-0 z-20"
      type="file"
      @change="handleFileChange"
      accept="image/*"
    />
    <vImage
      :src="imageSrc"
      class="block object-cover w-32 h-32 rounded-lg absolute left-0 top-0 z-10"
    />
    <div class="w-20 h-1 absolute left-6 top-1/2 -translate-y-1/2 bg-slate-400 rounded-md"></div>
    <div class="w-1 h-20 absolute top-6 left-1/2 -translate-x-1/2 bg-slate-400 rounded-md"></div>
    <Trash2 class="absolute right-2 top-2 z-30 cursor-pointer" v-if="imageSrc" @click="clearVal" />
  </div>
</template>
