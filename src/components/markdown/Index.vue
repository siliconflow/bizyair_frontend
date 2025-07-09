<template>
  <MdEditor
    :editorId="editorId"
    v-model="text"
    theme="dark"
    :toolbars="toolbar"
    ref="editorRef"
    :autoDetectCode="true"
    language="en-US"
    :preview="false"
    @input="handleInput"
    :style="{
      height: '200px'
    }"
    @on-upload-img="handleUploadImg"
    @on-focus="handleFocus"
    @on-blur="handleBlur"
  >
    <template #defToolbars>
      <NormalToolbar title="fullscreen" @onClick="handleFullClick">
        <template #trigger>
          <Maximize class="w-4 h-4 mt-1" />
        </template>
      </NormalToolbar>
      <NormalToolbar title="image">
        <template #trigger>
          <div class="relative w-4 h-4 cursor-pointer">
            <input
              @change="uploadImg"
              type="file"
              class="absolute w-4 h-4 left-0 top-0 cursor-pointer opacity-0"
            />
            <Image class="w-4 h-4 cursor-pointer" />
          </div>
        </template>
      </NormalToolbar>
    </template>
  </MdEditor>
  <Teleport to="body" v-if="isFullscreen">
    <MdEditor
      v-model="text"
      theme="dark"
      :autoDetectCode="true"
      :editorId="`full-${editorId}`"
      :toolbars="toolbar"
      ref="editorRefFull"
      language="en-US"
      :pageFullscreen="true"
      class="fixed top-0 left-0 w-[100vw] h-[100vh] z-12000"
      @input="handleInput"
      @on-upload-img="handleUploadImg"
      @on-focus="handleFocus"
      @on-blur="handleBlur"
    >
      <template #defToolbars>
        <NormalToolbar title="fullscreen" @onClick="handleFullClick">
          <template #trigger>
            <Maximize class="w-4 h-4 mt-1" />
          </template>
        </NormalToolbar>
        <NormalToolbar title="image">
          <template #trigger>
            <div class="relative w-4 h-4">
              <input
                @change="uploadImgFull"
                type="file"
                class="absolute w-4 h-4 left-0 top-0 cursor-pointer opacity-0"
              />
              <Image class="w-4 h-4" />
            </div>
          </template>
        </NormalToolbar>
      </template>
    </MdEditor>
  </Teleport>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import screenfull from 'screenfull'
  import highlight from 'highlight.js'
  import prettier from 'prettier'
  import cropper from 'cropperjs'
  import { upload_image } from '@/api/public'

  import { formatToWebp, imageToOss } from '../modules/vUpload/imageToOss'
  import { MdEditor, config, NormalToolbar } from 'md-editor-v3'
  import { useToaster } from '@/components/modules/toats/index'
  import { Maximize, Image } from 'lucide-vue-next'

  import 'md-editor-v3/lib/style.css'

  const BLOCKED_KEYS = [
    'r',
    'q',
    'w',
    'n',
    'm',
    's',
    'o',
    'g',
    ',',
    '=',
    '+',
    '-',
    '.',
    'p',
    'c',
    'b',
    'm',
    '`',
    'f',
    'Enter',
    'Backspace'
  ]

  const toolbar = [
    'bold',
    'italic',
    'underline',
    'title',
    '-',
    'quote',
    'code',
    'table',
    1,
    '-',
    'mermaid',
    'katex',
    '-',
    '=',
    'preview',
    0
  ]

  const editorRef = ref(null)
  const editorRefFull = ref(null)
  const isFullscreen = ref(false)
  const handleFullClick = () => {
    isFullscreen.value = !isFullscreen.value
    if (isFullscreen.value) {
      screenfull.request()
      document.querySelectorAll('[role="dialog"]').forEach(el => (el.style.display = 'none'))
      document.querySelector('body').style['pointer-events'] = 'auto'
    } else {
      screenfull.exit()
      document.querySelectorAll('[role="dialog"]').forEach(el => (el.style.display = 'block'))
      document.querySelector('body').style['pointer-events'] = 'visible'
    }
  }

  const props = defineProps({
    editorId: String,
    modelValue: String,
    modelModifiers: Object,
    autoDetectCode: {
      type: Boolean,
      default: true
    }
  })

  const text = ref(props.modelValue)
  const emit = defineEmits(['update:modelValue', 'isUploading'])

  // 修复handleInput函数中的bug
  const handleInput = () => {
    emit('update:modelValue', text.value)
  }

  // 添加watch监听，确保所有值变化都会触发update:modelValue
  watch(
    text,
    newValue => {
      emit('update:modelValue', newValue)
    },
    { immediate: false }
  )

  // 监听props.modelValue的变化，确保双向绑定正确工作
  watch(
    () => props.modelValue,
    newValue => {
      if (newValue !== text.value) {
        text.value = newValue
      }
    }
  )

  const handleKeydown = event => {
    if (BLOCKED_KEYS.includes(event.key)) {
      event.stopPropagation()
    }
  }

  const handleFocus = event => {
    document.addEventListener('keydown', handleKeydown, true)
  }

  const handleBlur = event => {
    document.removeEventListener('keydown', handleKeydown, true)
  }

  const MAX_SIZE = 20 * 1024 * 1024
  const MAX_RETRIES = 3
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  const uploadWithRetry = async (fileBlob, retryCount = 0) => {
    const { file } = await formatToWebp(fileBlob)
    const { url } = await imageToOss(file)
    return url
  }

  const uploadImg = async e => {
    handleUploadImg([e.target.files[0]], urls => {
      urls.forEach(url => {
        editorRef.value.insert(() => {
          return {
            targetValue: `![image](${url})`,
            select: false,
            deviationStart: 0,
            deviationEnd: 0
          }
        })
        text.value += `![image](${url})`
        handleInput()
      })
    })
  }
  const uploadImgFull = async e => {
    handleUploadImg([e.target.files[0]], urls => {
      urls.forEach(url => {
        editorRefFull.value.insert(() => {
          return {
            targetValue: `![image](${url})`,
            select: false,
            deviationStart: 0,
            deviationEnd: 0
          }
        })
        text.value += `![image](${url})`
        handleInput()
      })
    })
  }

  const handleUploadImg = async (files, callback) => {
    const invalidFiles = files.filter(file => !ALLOWED_TYPES.includes(file.type))
    if (invalidFiles.length > 0) {
      useToaster.warning('Only image files allowed (jpg, png, gif, webp)')
      return
    }

    const oversizedFiles = files.filter(file => file.size > MAX_SIZE)
    if (oversizedFiles.length > 0) {
      useToaster.warning('Image size cannot exceed 20MB')
      return
    }
    try {
      emit('isUploading', true)
      const urls = []
      for (let i = 0; i < files.length; i++) {
        const url = await uploadWithRetry(files[i])
        urls.push(url)
      }
      if (urls.length === files.length) {
        callback(urls)
      } else {
        useToaster.error('Some files failed to upload')
      }
    } catch (error) {
      useToaster.error('Upload failed, please try again')
    } finally {
      emit('isUploading', false)
    }
  }

  config({
    editorExtensions: {
      highlight: {
        instance: highlight
      },
      prettier: {
        prettierInstance: prettier,
        parserMarkdownInstance: 'markdown'
      },
      cropper: {
        instance: cropper
      },
      screenfull: {
        instance: screenfull
      }
    }
  })
</script>
<style scoped>
  :deep(.md-editor-toolbar-item svg.md-editor-icon) {
    @apply w-6 h-6;
  }

  /* :deep(.md-editor-menu-item.md-editor-menu-item-image:last-child) {
  @apply hidden;
} */
</style>
