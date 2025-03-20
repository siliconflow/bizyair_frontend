<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import vImage from '@/components/modules/vImage.vue'
  import { Trash2 } from 'lucide-vue-next'
  import { formatToWebp, imageToOss } from './imageToOss'
  import { cn } from '@/lib/utils'
  import { useI18n } from 'vue-i18n'

  // 导入useI18n以启用模板中的$t函数
  // 在setup script中我们不需要使用t函数，所以不需要解构它
  useI18n()
  
  const imageSrc = ref('')
  const fileInput = ref<any>()
  const showLoading = ref(false)
  const emit = defineEmits(['update:modelValue', 'done', 'change'])

  const props = defineProps({
    previewPrc: String,
    className: String
  })

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    showLoading.value = true
    emit('change', files)
    if (files) {
      imageSrc.value = URL.createObjectURL(files[0])
      emit('update:modelValue', imageSrc.value)
      const { file } = await formatToWebp(files[0])
      const { url } = await imageToOss(file)
      imageSrc.value = url
      emit('update:modelValue', imageSrc.value)
      showLoading.value = false
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
  <div>
    <div
      :class="
        cn(
          'w-32 h-32 border border-dashed border-slate-300 rounded-lg relative overflow-hidden',
          props.className
        )
      "
      :title="$t('vUpload.uploadImage')"
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
        class="block object-cover w-full h-full rounded-lg absolute left-0 top-0 z-10"
      />
      <div
        class="w-[64%] h-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-400 rounded-md"
      ></div>
      <div
        class="w-1 h-[64%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-400 rounded-md"
      ></div>
      <Trash2
        class="absolute right-2 top-2 z-30 cursor-pointer"
        v-if="imageSrc"
        @click="clearVal"
      />
    </div>
    <div v-if="showLoading" class="fixed w-[100vw] h-[100vh] left-0 top-0 bg-black/40 z-13000">
      <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
          <circle cx="12" cy="2" r="0" fill="currentColor">
            <animate
              attributeName="r"
              begin="0"
              calcMode="spline"
              dur="1s"
              keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
              repeatCount="indefinite"
              values="0;2;0;0"
            />
          </circle>
          <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(45 12 12)">
            <animate
              attributeName="r"
              begin="0.125s"
              calcMode="spline"
              dur="1s"
              keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
              repeatCount="indefinite"
              values="0;2;0;0"
            />
          </circle>
          <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(90 12 12)">
            <animate
              attributeName="r"
              begin="0.25s"
              calcMode="spline"
              dur="1s"
              keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
              repeatCount="indefinite"
              values="0;2;0;0"
            />
          </circle>
          <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(135 12 12)">
            <animate
              attributeName="r"
              begin="0.375s"
              calcMode="spline"
              dur="1s"
              keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
              repeatCount="indefinite"
              values="0;2;0;0"
            />
          </circle>
          <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(180 12 12)">
            <animate
              attributeName="r"
              begin="0.5s"
              calcMode="spline"
              dur="1s"
              keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
              repeatCount="indefinite"
              values="0;2;0;0"
            />
          </circle>
          <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(225 12 12)">
            <animate
              attributeName="r"
              begin="0.625s"
              calcMode="spline"
              dur="1s"
              keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
              repeatCount="indefinite"
              values="0;2;0;0"
            />
          </circle>
          <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(270 12 12)">
            <animate
              attributeName="r"
              begin="0.75s"
              calcMode="spline"
              dur="1s"
              keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
              repeatCount="indefinite"
              values="0;2;0;0"
            />
          </circle>
          <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(315 12 12)">
            <animate
              attributeName="r"
              begin="0.875s"
              calcMode="spline"
              dur="1s"
              keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
              repeatCount="indefinite"
              values="0;2;0;0"
            />
          </circle>
        </svg>
      </div>
      <div class="fixed left-1/2 top-[60%] -translate-x-1/2 text-white">
        {{ $t('vUpload.loading') }}
      </div>
    </div>
  </div>
</template>
