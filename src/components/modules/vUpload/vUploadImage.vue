<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import vImage from '@/components/modules/vImage.vue'
  import { Trash2 } from 'lucide-vue-next'
  import { formatToWebp, imageToOss } from './imageToOss'
  import { cn } from '@/lib/utils'
  import { useI18n } from 'vue-i18n'

  // 导入useI18n以启用模板中的$t函数
  // 在setup script中我们不需要使用t函数，所以不需要解构它
  useI18n()

  const mediaSrc = ref('')
  const fileInput = ref<any>()
  const showLoading = ref(false)
  const currentFile = ref<File | null>(null)
  const emit = defineEmits(['update:modelValue', 'done', 'change'])

  const props = defineProps({
    previewPrc: String,
    className: String
  })

  // 检测文件类型
  const isVideo = computed(() => {
    if (!currentFile.value) return false
    console.log(mediaSrc.value)
    return currentFile.value.type.startsWith('video/')
  })

  // const isGif = computed(() => {
  //   if (!currentFile.value) return false
  //   return currentFile.value.type === 'image/gif'
  // })

  const isImage = computed(() => {
    if (!currentFile.value) return !isVideo.value
    return currentFile.value.type.startsWith('image/')
  })

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    showLoading.value = true
    emit('change', files)
    if (files) {
      const file = files[0]
      currentFile.value = file

      // 创建预览URL
      mediaSrc.value = URL.createObjectURL(file)
      emit('update:modelValue', mediaSrc.value)

      try {
        let processedFile = file

        // 如果是图片且不是gif，才进行webp压缩
        if (file.type.startsWith('image/') && file.type !== 'image/gif') {
          const { file: webpFile } = await formatToWebp(file)
          processedFile = webpFile
        }

        // 上传到OSS
        const { url } = await imageToOss(processedFile)
        mediaSrc.value = url
        emit('update:modelValue', mediaSrc.value)
        showLoading.value = false
        emit('done')
      } catch (error) {
        console.error('文件处理失败:', error)
        showLoading.value = false
      }
    }
  }

  const clearVal = () => {
    mediaSrc.value = ''
    currentFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  onMounted(() => {
    let previewPrc = props.previewPrc as string
    if (previewPrc.includes('.mp4')) {
      previewPrc = `${previewPrc}?x-oss-process=video/snapshot,t_0000,f_jpg,w_300,h_600`
    }
    mediaSrc.value = previewPrc
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
        accept="image/*,video/*"
      />

      <!-- 视频预览 -->
      <video
        v-if="isVideo && mediaSrc"
        :src="mediaSrc"
        class="block object-cover w-full h-full rounded-lg absolute left-0 top-0 z-10"
        muted
        controls
      />

      <!-- 图片预览 -->
      <vImage
        v-else-if="isImage && mediaSrc"
        :src="mediaSrc"
        class="block object-cover w-full h-full rounded-lg absolute left-0 top-0 z-10"
      />

      <!-- 占位符 -->
      <div v-if="!mediaSrc">
        <div
          class="w-[64%] h-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-400 rounded-md"
        ></div>
        <div
          class="w-1 h-[64%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-400 rounded-md"
        ></div>
      </div>

      <Trash2
        class="absolute right-2 top-2 z-30 cursor-pointer text-white bg-black/50 rounded p-1"
        v-if="mediaSrc"
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
