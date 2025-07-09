<template>
  <Teleport to="body">
    <div class="sidebar-wrapper" v-if="sidebarStore.isOpen" :style="{ width: `${sidebarWidth}px` }">
      <div class="resize-handle" @mousedown="startResize"></div>
      <div class="sidebar-header">
        <h2>{{ $t('sidebar.assistant.title') }}</h2>
        <div class="header-actions">
          <button class="action-btn interactive-element" @click="clearHistory" title="清空对话历史">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
          </button>
          <button class="close-btn interactive-element" @click="sidebarStore.closeSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
          >
            <div class="message-avatar">
              <div class="avatar-icon">
                {{ message.role === 'user' ? '👤' : '🤖' }}
              </div>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{
                  message.role === 'user' ? 'You' : $t('sidebar.assistant.title')
                }}</span>
                <span class="message-time">{{ message.time }}</span>
              </div>

              <!-- 图片消息 -->
              <div v-if="message.hasImage" class="message-image">
                <div class="image-container">
                  <img
                    :src="message.image"
                    alt="用户上传图片"
                    class="message-img"
                  />
                  <div class="image-overlay">
                    <button class="image-action-btn expand-btn" @click="expandImage(message.image)" title="查看大图">
                      <svg t="1752053278648" fill="white" width="24" height="24" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2363" ><path d="M919.920093 725.414549q3.014188 26.122962 7.033105 58.776664t7.53547 66.814498 7.53547 67.819227 7.033105 60.786122q6.028376 47.222277-41.193901 44.208089-25.118232-2.009459-56.767205-5.526011t-64.805039-7.53547-65.809769-8.037834-59.781393-7.033105q-29.137149-3.014188-37.174984-16.578033t9.042564-30.644243q11.052022-10.047293 27.127691-27.630056t27.127691-28.634785q11.052022-12.056752 7.033105-22.104044t-16.075669-23.108774q-28.13242-27.127691-51.241194-49.231735t-51.241194-51.241194q-6.028376-6.028376-12.056752-13.061481t-9.042564-15.573304-1.004729-18.085127 13.061481-20.59695q6.028376-6.028376 10.047293-10.549658t8.037834-8.037834 8.540199-8.037834 11.554387-12.559116q20.094586-20.094586 37.174984-17.080398t37.174984 23.108774 41.193901 40.691536 47.222277 46.719912q19.089857 18.085127 32.653702 25.118232t26.625326-6.028376q9.042564-9.042564 22.606409-21.60168t23.611138-22.606409q17.080398-17.080398 30.644243-13.061481t16.578033 30.141879zM43.79615 383.80659q-3.014188-26.122962-7.033105-58.776664t-7.53547-66.814498-7.53547-67.819227-7.033105-60.786122q-3.014188-26.122962 6.53074-36.170255t33.658431-8.037834q25.118232 2.009459 56.767205 5.526011t64.805039 7.53547 65.809769 8.037834 59.781393 7.033105q30.141879 3.014188 37.677348 16.578033t-9.544928 30.644243q-10.047293 10.047293-24.615868 26.122962t-25.620597 27.127691q-12.056752 12.056752-8.037834 22.104044t17.080398 23.108774q13.061481 14.06621 24.615868 24.615868t22.606409 21.099315 23.108774 22.606409l25.118232 25.118232q6.028376 6.028376 11.554387 14.06621t8.037834 17.080398-0.502365 19.089857-13.061481 20.094586l-11.052022 11.052022q-4.018917 4.018917-7.53547 8.037834t-8.540199 8.037834l-11.052022 12.056752q-20.094586 20.094586-34.663161 15.070939t-34.663161-25.118232-38.179713-37.677348-44.208089-43.705724q-18.085127-18.085127-32.151337-25.118232t-27.127691 6.028376q-9.042564 10.047293-25.118232 24.615868t-26.122962 24.615868q-17.080398 17.080398-30.141879 13.061481t-16.075669-30.141879zM905.853883 84.397261q26.122962-3.014188 36.170255 6.53074t8.037834 34.663161-5.526011 56.767205-7.53547 64.805039-8.037834 65.809769-7.033105 59.781393q-3.014188 29.137149-16.578033 37.174984t-30.644243-10.047293q-10.047293-10.047293-26.122962-24.615868t-27.127691-25.620597q-12.056752-11.052022-22.104044-7.53547t-23.108774 16.578033q-27.127691 27.127691-47.724641 49.231735t-48.729371 50.236465q-6.028376 6.028376-14.06621 11.554387t-17.080398 8.037834-19.089857-0.502365-20.094586-14.06621q-6.028376-6.028376-10.549658-10.047293t-8.540199-8.037834-8.540199-8.037834-11.554387-12.056752q-20.094586-20.094586-16.075669-35.165525t25.118232-35.165525l38.179713-40.189172q19.089857-20.094586 45.212818-46.217547 19.089857-18.085127 26.122962-32.151337t-7.033105-26.122962q-9.042564-9.042564-23.108774-24.615868t-24.113503-25.620597q-17.080398-17.080398-13.061481-30.141879t30.141879-16.075669 58.776664-7.033105 67.316863-7.53547 67.819227-7.53547 60.283758-7.033105zM350.238584 640.012559q6.028376 6.028376 10.549658 10.047293t8.540199 8.037834l8.037834 9.042564 12.056752 11.052022q20.094586 20.094586 17.582763 36.672619t-23.611138 37.677348q-19.089857 19.089857-40.189172 40.691536t-47.222277 47.724641q-18.085127 18.085127-22.606409 29.639514t8.540199 24.615868q10.047293 9.042564 22.606409 22.606409t22.606409 23.611138q17.080398 17.080398 12.559116 30.141879t-30.644243 16.075669-58.274299 7.033105-66.814498 8.037834-68.321592 8.037834-60.786122 7.033105q-25.118232 2.009459-35.66789-7.53547t-8.540199-33.658431q2.009459-25.118232 5.526011-56.767205t7.53547-64.805039 8.037834-65.809769 7.033105-59.781393q3.014188-30.141879 16.578033-37.677348t30.644243 9.544928q10.047293 10.047293 27.630056 26.122962t28.634785 27.127691q12.056752 12.056752 20.094586 10.549658t20.094586-14.568575q13.061481-13.061481 25.118232-25.620597t24.113503-24.615868 24.615868-25.118232 26.625326-27.127691q6.028376-6.028376 13.061481-12.056752t15.573304-9.042564 18.085127-0.502365 20.59695 13.563845z" p-id="2364"></path></svg>
                    </button>
                    <div class="top-right-actions">
                      <button class="image-action-btn" @click="selectExistingImage(message.image||'')" title="添加到输入">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                      </button>
                      <button class="image-action-btn" @click="downloadImage(message.image||'')" title="下载图片">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  v-if="
                    message.role === 'assistant' &&
                    sidebarStore.nodeInfo &&
                    canApplyToNode(sidebarStore.nodeInfo) &&
                    !serverMode
                  "
                  class="image-actions"
                >
                  <button
                    class="apply-to-node-btn"
                    @click="applyImageToNode(message.image)"
                    :title="getNodeActionTitle(sidebarStore.nodeInfo)"
                  >
                    {{ getNodeActionText(sidebarStore.nodeInfo) }}
                  </button>
                </div>
              </div>

              <!-- 文本消息 -->
              <div class="message-text" v-html="message.content"></div>
            </div>
          </div>
          <div v-if="isLoading" class="loading-indicator">
            <div class="loading-text">{{ processingStatus }}</div>
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div v-if="sidebarStore?.nodeInfo" style="display: flex; justify-content: space-around">
            <div class="info-item">
              <span class="label">{{ $t('sidebar.assistant.nodeName') }}:</span>
              <span class="value">{{ sidebarStore.nodeInfo.title }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('sidebar.assistant.nodeType') }}:</span>
              <span class="value">{{ sidebarStore.nodeInfo.type }}</span>
            </div>
          </div>
          <div class="image-preview-area" v-if="previewImage">
            <div class="preview-image-container">
              <img :src="previewImage" alt="图片预览" class="preview-image-small" />
              <button class="remove-image-btn" @click="removeImage">×</button>
            </div>
          </div>

          <div class="input-controls">
            <button
              class="upload-image-btn interactive-element"
              @click="triggerImageUpload"
              :disabled="isLoading"
              :title="$t('sidebar.assistant.uploadImage')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14L6 17h12l-3.86-5.14z"
                />
              </svg>
            </button>

            <div class="textarea-container interactive-element">
              <textarea
                class="interactive-element"
                v-model="userInput"
                :placeholder="$t('sidebar.assistant.inputPlaceholder')"
                @keydown.enter="handleKeyDown"
                ref="textareaRef"
                :disabled="isLoading"
              ></textarea>
            </div>

            <!-- 回答时时禁用发送按钮 -->
            <button
              class="send-message-btn interactive-element"
              @click="sendMessage()"
              :disabled="isGenerating"
              :title="$t('sidebar.assistant.sendMessage')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2l.01 7z" />
              </svg>
            </button>

            <!-- 生成时显示取消按钮 -->
            <button
              v-if="isGenerating"
              class="control-btn stop-btn interactive-element"
              @click="abortGeneration"
              title="取消生成"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 6h12v12H6z" />
              </svg>
            </button>
          </div>

          <input
            type="file"
            ref="imageInputRef"
            style="display: none"
            accept="image/*"
            @change="handleImageUpload"
          />
        </div>
      </div>
    </div>
    
    <!-- 图片查看弹窗 -->
    <div class="image-modal" v-if="showImageModal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <img :src="modalImageSrc" alt="大图查看" class="modal-image" />
        <button class="modal-close-btn" @click="closeImageModal">×</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { useSidebarStore } from '../../stores/sidebarStore'
  import { onMounted, watch, ref, computed, onBeforeUnmount, nextTick } from 'vue'
  import {
    sendStreamChatRequest,
    createImageUserMessage,
    formatOutputTextLight,
    handleImageWithKontextPro
  } from './util'
  import { useI18n } from 'vue-i18n'
  import { useToaster } from '@/components/modules/toats/index'
  import { v4 as uuidv4 } from 'uuid'
  import {downloadImage} from '@/utils/tool'
  const { t } = useI18n()
  const sidebarStore = useSidebarStore()

  // 侧边栏宽度相关变量
  const sidebarWidth = ref(550) // 默认宽度
  const minWidth = 50 // 最小宽度
  const maxWidth = 1300 // 最大宽度
  const isResizing = ref(false)

  // 开始拖拽
  const startResize = (e: MouseEvent) => {
    isResizing.value = true
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
    // 防止选中文本
    e.preventDefault()
  }

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.value) return

    // 计算宽度 (窗口宽度 - 鼠标位置)
    const newWidth = window.innerWidth - e.clientX

    // 限制宽度范围
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth.value = newWidth
      // 保存宽度到本地存储
      localStorage.setItem('bizyair-sidebar-width', newWidth.toString())
    }
  }

  // 停止拖拽
  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  // 组件卸载前清理事件监听器
  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  })
  ;('---------------------------------------')

  // 聊天相关状态
  const chatMessages = ref<
    Array<{
      role: 'user' | 'assistant'
      content: string
      time: string
      hasImage?: boolean
      image?: string
      id?: string
    }>
  >([])
  const userInput = ref('')
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const processingStatus = ref('')
  const previewImage = ref('')
  const uploadedImageBase64 = ref('')
  const chatMessagesRef = ref<HTMLElement | null>(null)
  const textareaRef = ref<HTMLTextAreaElement | null>(null)
  const imageInputRef = ref<HTMLInputElement | null>(null)
  // 添加请求中止控制器
  const abortController = ref<AbortController | null>(null)

  // 计算属性：是否可以发送消息
  const canSendMessage = computed(() => userInput.value.trim() !== '' || previewImage.value !== '')

  // 获取当前时间格式化字符串
  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 触发图片上传
  const triggerImageUpload = () => imageInputRef.value?.click()

  // 处理图片上传
  const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return

    const file = target.files[0]

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      useToaster({
        type: 'error',
        message: t('sidebar.assistant.imageUploadError')
      })
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      previewImage.value = result
      uploadedImageBase64.value = result.split(',')[1] // 去掉 data:image/png;base64, 前缀
    }
    reader.readAsDataURL(file)
  }

  // 移除已选图片
  const removeImage = () => {
    previewImage.value = ''
    uploadedImageBase64.value = ''
    if (imageInputRef.value) {
      imageInputRef.value.value = ''
    }
  }

  const promptId = ref('')
  const requestId = ref('')

  // 生成新的会话ID
  const generateNewPromptId = () => {
    promptId.value = uuidv4()
    localStorage.setItem('bizyair-prompt-id', promptId.value)
  }

  // 生成新的请求ID
  const generateNewRequestId = () => {
    requestId.value = uuidv4()
  }

  // 清空对话历史
  const clearHistory = () => {
    if (isGenerating.value) {
      abortGeneration()
    }
    // 创建一个新的欢迎消息
    const welcomeMessage = {
      role: 'assistant' as const,
      content: t('sidebar.assistant.welcomeMessage'),
      time: getCurrentTime()
    }

    setTimeout(() => {
      chatMessages.value = [welcomeMessage]
      generateNewPromptId()
    }, 10)
  }

  // 中止生成
  const abortGeneration = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      isLoading.value = false
      isGenerating.value = false
      processingStatus.value = ''
    }
  }

  // 服务端模式
  const serverMode = ref(false)

  const sendMessage = async () => {
    if (!canSendMessage.value || isLoading.value) return
    generateNewRequestId()

    const messageText = userInput.value
    const currentTime = getCurrentTime()
    const hasImage = !!previewImage.value
    const isImageGeneration = messageText.trim().startsWith('生成图片:')

    nextTick(() => {
      isLoading.value = true
      isGenerating.value = true
    })

    // 创建用户消息并添加到聊天记录
    const userMessage = {
      role: 'user' as const,
      content: messageText || '',
      time: currentTime,
      hasImage: hasImage,
      image: previewImage.value
    }

    chatMessages.value.push(userMessage)

    // 清空输入并滚动到底部
    userInput.value = ''

    setTimeout(() => {
      scrollToBottom()
    }, 0)

    try {
      if (hasImage && !isImageGeneration) {
        processingStatus.value = '正在编辑图片...'
        try {
          // 创建AbortController用于中止图片编辑请求
          abortController.value = new AbortController()
          const imageUrl = await handleImageWithKontextPro(
            messageText || '请编辑这张图片',
            previewImage.value,
            abortController.value.signal
          )

          if (abortController.value?.signal.aborted) {
            isLoading.value = false
            isGenerating.value = false
            processingStatus.value = ''
            return
          }
          // Image预加载
          const img = new Image()
          await new Promise((resolve, reject) => {
            img.onload = () => resolve(true)
            img.onerror = () => reject(new Error('图片加载失败'))
            img.src = imageUrl
          })
          // 图片加载成功后，添加带图片的消息
          const assistantMessage = {
            role: 'assistant' as const,
            content: serverMode.value
              ? '已为您编辑图片'
              : '已为您编辑图片，点击LoadImage节点可以直接应用。',
            time: getCurrentTime(),
            hasImage: true,
            image: imageUrl
          }
          chatMessages.value.push(assistantMessage)
          // 更新状态
          isLoading.value = false
          isGenerating.value = false
          processingStatus.value = ''
          removeImage() // 清除已处理的图片
          // 滚动到底部
          setTimeout(() => {
            scrollToBottom()
          }, 0)

          return
        } catch (error: any) {
          const errorMsgTime = getCurrentTime()
          let errorMessage = ''
          if (error) {
            errorMessage = error.message
          }
          chatMessages.value.push({
            role: 'assistant',
            content: `发生错误: ${errorMessage}<br><br><span style="color: #ff4d4f;">建议检查Bizyair是否更新到最新版本，并检查网络状态或者代理</span>`,
            time: errorMsgTime
          })
          isLoading.value = false
          isGenerating.value = false
          processingStatus.value = ''
          setTimeout(() => {
            scrollToBottom()
          }, 0)

          return
        }
      }
      // 创建AbortController用于中止请求
      abortController.value = new AbortController()

      // 准备历史对话数据
      const historyMessages = chatMessages.value
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .slice(-6) // 保留最近6条消息传入
        .map(msg => {
          // 处理带图片的消息
          if (msg.hasImage && msg.image && msg.role === 'user') {
            return createImageUserMessage(msg.content, msg.image)
          } else {
            return {
              role: msg.role,
              content: msg.content
            }
          }
        })

      // 记录当前消息时间，用于标识当前回答
      const currentMsgTime = getCurrentTime()
      let isFirstToken = true

      // 使用流式聊天请求
      abortController.value = await sendStreamChatRequest(
        historyMessages,
        {
          onStart: () => {
            console.log('开始请求多模态模型...')
            isLoading.value = true
            // 立即滚动到底部
            setTimeout(() => {
              scrollToBottom()
              removeImage()
            }, 0)
          },
          onToken: (token: string) => {
            // 首次接收到token时创建新的助手消息
            if (isFirstToken) {
              chatMessages.value.push({
                role: 'assistant',
                content: token,
                time: currentMsgTime
              })
              isFirstToken = false
              isLoading.value = false
            } else {
              // 找到刚创建的消息并更新
              const currentAssistantMsg = chatMessages.value
                .filter(msg => msg.role === 'assistant' && msg.time === currentMsgTime)
                .pop()

              if (currentAssistantMsg) {
                currentAssistantMsg.content += token

                // 实时应用格式化
                const formattedText = formatOutputTextLight(currentAssistantMsg.content)
                currentAssistantMsg.content = formattedText
              }
            }

            // 滚动到底部
            setTimeout(() => {
              scrollToBottom()
            }, 0)
          },
          onComplete: (fullText: string) => {
            console.log('多模态模型响应完成')

            // 更新状态
            isLoading.value = false
            isGenerating.value = false
            processingStatus.value = ''

            // 确保UI显示完整的回复
            const currentAssistantMsg = chatMessages.value
              .filter(msg => msg.role === 'assistant' && msg.time === currentMsgTime)
              .pop()

            if (currentAssistantMsg) {
              currentAssistantMsg.content = fullText
            }

            // 滚动到底部
            setTimeout(() => {
              scrollToBottom()
            }, 0)

            // 清除上传的图片
            // removeImage();
          },
          onError: error => {
            console.error('多模态请求失败:', error)
            const errorMsgTime = getCurrentTime()
            let errorMessage = ''
            if (error) {
              errorMessage = error.message
            }
            // 添加错误消息
            chatMessages.value.push({
              role: 'assistant',
              content: `发生错误: ${errorMessage}<br><br><span style="color: #ff4d4f;">建议检查Bizyair是否更新到最新版本，并检查网络状态或者代理</span>`,
              time: errorMsgTime
            })

            // 更新状态
            isLoading.value = false
            isGenerating.value = false
            processingStatus.value = ''
          }
        },
        {
          model: 'Pro/deepseek-ai/DeepSeek-V3',
          prompt_id: promptId.value,
          request_id: requestId.value
        }
      )
    } catch (error) {
      const errorMsgTime = getCurrentTime()

      // 添加错误消息
      chatMessages.value.push({
        role: 'assistant',
        content: String(error),
        time: errorMsgTime
      })

      // 更新状态
      isLoading.value = false
      isGenerating.value = false
      processingStatus.value = ''
    } finally {
      console.log('请求处理完成，重置状态')
      processingStatus.value = ''
      if (!abortController.value) {
        abortController.value = null
      }
      // 滚动到底部
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    }
  }

  // 滚动到聊天底部
  const scrollToBottom = () => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  }

  // 处理节点信息更新
  watch(
    () => sidebarStore.nodeInfo,
    newValue => {
      console.log('节点信息更新:', newValue)
      if (newValue?.imageInfo?.url || newValue?.imageInfo?.base64) {
        // 直接设置预览图片，就像用户上传了一样
        const imageUrl = newValue.imageInfo.base64 || newValue.imageInfo.url || ''

        // 设置上传的图片以便用户可以输入文本后发送
        previewImage.value = imageUrl

        // 处理base64数据
        if (newValue.imageInfo.base64) {
          // 检查是否已包含data:前缀
          if (typeof newValue.imageInfo.base64 === 'string') {
            uploadedImageBase64.value = newValue.imageInfo.base64.startsWith('data:')
              ? newValue.imageInfo.base64.split(',')[1]
              : newValue.imageInfo.base64
          }
        } else if (newValue.imageInfo.url) {
          // 如果没有base64，则尝试从URL加载并转换
          fetch(newValue.imageInfo.url)
            .then(response => response.blob())
            .then(blob => {
              const reader = new FileReader()
              reader.onloadend = () => {
                const base64data = reader.result
                if (typeof base64data === 'string') {
                  uploadedImageBase64.value = base64data.split(',')[1] // 移除data:image/...前缀
                }
              }
              reader.readAsDataURL(blob)
            })
            .catch(error => console.error('获取图片出错:', error))
        }

        // 聚焦到输入框
        setTimeout(() => {
          textareaRef.value?.focus()
        }, 0)
      }
    },
    { deep: true }
  )

  // 修改canApplyToNode函数来返回更具体的操作类型
  const canApplyToNode = (nodeInfo: any) => {
    // 根据节点类型返回不同的操作类型
    if (!nodeInfo || !nodeInfo.type) return false

    const nodeType = nodeInfo.type
    if (nodeType === 'LoadImage') {
      return 'apply' // 应用到节点
    } else if (nodeType === 'SaveImage') {
      return 'save-output' // 保存到output目录
    } else if (nodeType === 'PreviewImage') {
      return 'save-temp' // 保存到temp目录
    }
    return false // 其他类型节点不支持操作
  }

  // 添加getNodeActionText函数，返回按钮文本
  const getNodeActionText = (nodeInfo: any) => {
    const actionType = canApplyToNode(nodeInfo)
    if (actionType === 'apply') {
      return '应用到当前节点'
    } else if (actionType === 'save-output') {
      return '保存到output目录'
    } else if (actionType === 'save-temp') {
      return '保存到temp目录'
    }
    return '应用到节点'
  }

  // 添加getNodeActionTitle函数，返回提示文本
  const getNodeActionTitle = (nodeInfo: any) => {
    const actionType = canApplyToNode(nodeInfo)
    if (actionType === 'apply') {
      return '将图片应用到LoadImage节点'
    } else if (actionType === 'save-output') {
      return '将图片保存到output目录'
    } else if (actionType === 'save-temp') {
      return '将图片保存到temp目录'
    }
    return ''
  }

  // 应用图片到当前节点
  const applyImageToNode = async (imageUrl: string | undefined) => {
    if (!sidebarStore.nodeInfo) {
      console.error('没有选中的节点信息')
      return
    }

    if (!imageUrl) {
      console.error('没有图片URL')
      return
    }
    let base64Data = imageUrl

    if (!imageUrl.startsWith('data:')) {
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        base64Data = await new Promise(resolve => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      } catch (error) {
        console.error('获取图片数据失败:', error)
        useToaster({
          type: 'error',
          message: '获取图片数据失败，无法应用到节点'
        })
        return
      }
    }

    // 创建要发送到节点的图片数据对象
    const imageData = {
      nodeId: sidebarStore.nodeInfo.id,
      imageBase64: base64Data,
      nodeType: sidebarStore.nodeInfo.type
    }
    console.log(window.bizyAirLib, 'window.bizyAirLib-----')

    // 如果window.bizyAirLib存在并有updateNodeImage方法，调用它
    if (
      typeof window.bizyAirLib !== 'undefined' &&
      typeof window.bizyAirLib.updateNodeImage === 'function'
    ) {
      window.bizyAirLib.updateNodeImage(imageData)
      useToaster({
        type: 'success',
        message: '图片已应用到节点: ' + sidebarStore.nodeInfo.title
      })
    } else {
      console.error('bizyAirLib.updateNodeImage未定义')
      useToaster({
        type: 'error',
        message: '应用图片到节点失败'
      })
    }
  }

  // enter发送，shift+enter换行
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.shiftKey) {
      return
    }
    // enter键，发送消息
    e.preventDefault()
    sendMessage()
  }

  // 选择现有图片
  const selectExistingImage = (imageUrl: string) => {
    if (!imageUrl) return
    previewImage.value = imageUrl
    // 如果图片URL以data:开头，则为base64格式
    if (previewImage.value.includes('data:')) {
      try {
        // 提取base64部分
        const base64Part = previewImage.value.split('base64,')[1]
        if (base64Part) {
          uploadedImageBase64.value = base64Part
          console.log('已设置base64数据，长度:', uploadedImageBase64.value.length)
        } else {
          console.error('无法从图片URL提取base64数据')
        }
      } catch (error) {
        console.error('解析base64数据出错:', error)
      }
    } else if (imageUrl.startsWith('http')) {
      // 否则尝试将图片转换为base64
      console.log('正在获取远程图片:', imageUrl.substring(0, 50) + '...')
      fetch(imageUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`无法获取图片: ${response.status} ${response.statusText}`)
          }
          return response.blob()
        })
        .then(blob => {
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              previewImage.value = reader.result
              const base64data = reader.result.split('base64,')[1]
              if (base64data) {
                uploadedImageBase64.value = base64data
                console.log('已转换远程图片为base64，长度:', uploadedImageBase64.value.length)
              }
            }
          }
          reader.readAsDataURL(blob)
        })
        .catch(error => console.error('获取图片出错:', error))
    }

    // 聚焦到输入框
    setTimeout(() => {
      textareaRef.value?.focus()
    }, 0)
  }

  // 图片弹窗相关状态
  const showImageModal = ref(false)
  const modalImageSrc = ref('')
  
  // 放大查看图片
  const expandImage = (imageSrc: string | undefined) => {
    if (!imageSrc) return
    modalImageSrc.value = imageSrc
    showImageModal.value = true
  }
  
  // 关闭图片弹窗
  const closeImageModal = () => {
    showImageModal.value = false
  }
  


  onMounted(() => {
    // 从本地存储加载宽度设置
    const savedWidth = localStorage.getItem('bizyair-sidebar-width')
    if (savedWidth) {
      const width = parseInt(savedWidth)
      if (width >= minWidth && width <= maxWidth) {
        sidebarWidth.value = width
      }
    }

    const savedPromptId = localStorage.getItem('bizyair-prompt-id')
    if (savedPromptId) {
      promptId.value = savedPromptId
    } else {
      generateNewPromptId()
    }
    generateNewRequestId()

    // 确保全局bizyAirLib对象存在
    if (typeof window.bizyAirLib === 'undefined') {
      ;(window as any).bizyAirLib = {}
    }

    // 直接定义updateNodeImage方法
    if (typeof (window as any).bizyAirLib.updateNodeImage !== 'function') {
      ;(window as any).bizyAirLib.updateNodeImage = function (imageData: any) {
        if (!imageData || !imageData.nodeId || !imageData.imageBase64) {
          console.error('应用图片到节点失败: 缺少必要的参数')
          return
        }

        try {
          console.log('正在尝试应用图片到节点...')

          // 直接使用传入的imageData.nodeId通过IFRAME找到节点
          // bizyAirLib直接传递postMessage到父窗口
          window.parent.postMessage(
            {
              type: 'APPLY_IMAGE_TO_NODE',
              data: {
                nodeId: imageData.nodeId,
                base64Data: imageData.imageBase64
              }
            },
            '*'
          )

          console.log('已发送图片应用消息到ComfyUI')
        } catch (error) {
          console.error('应用图片到节点时发生异常:', error)
        }
      }
      console.log('已添加updateNodeImage方法到bizyAirLib对象')
    }

    // 显示欢迎消息
    const welcomeMessage = {
      role: 'assistant' as const,
      content: t('sidebar.assistant.welcomeMessage'),
      time: getCurrentTime()
    }

    chatMessages.value = [welcomeMessage]

    // 异步获取 server_mode
    ;(async () => {
      try {
        const res = await fetch('/bizyair/server_mode')
        const data = await res.json()
        serverMode.value = !!data?.data?.server_mode
      } catch (e) {
        serverMode.value = false
      }
    })()
  })
</script>

<style>
  .sidebar-wrapper {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    background-color: #2d2d2d;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 99999;
    transition: width 0.1s ease;
    pointer-events: auto;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    cursor: col-resize;
    background-color: transparent;
  }

  .resize-handle:hover,
  .resize-handle:active {
    background-color: rgba(124, 58, 237, 0.3);
  }

  /* 拖拽过程中添加样式到body */
  body.resizing {
    cursor: col-resize;
    user-select: none;
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #333;
    border-bottom: 1px solid #444;
    flex-shrink: 0;
  }

  .sidebar-header h2 {
    margin: 0;
    font-size: 16px;
    color: #fff;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-btn,
  .close-btn {
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .action-btn {
    pointer-events: auto;
    position: relative;
    z-index: 1000;
  }

  .close-btn {
    pointer-events: auto;
    position: relative;
    z-index: 1000;
  }

  .action-btn:hover,
  .close-btn:hover {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .sidebar-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #eee;
    height: 100%;
    padding: 16px;
  }

  .node-info {
    background-color: #333;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #444;
  }

  .node-info h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #fff;
    border-bottom: 1px solid #444;
    padding-bottom: 8px;
  }

  .info-item {
    margin-bottom: 8px;
    display: flex;
  }

  .info-item .label {
    color: #aaa;
    margin-right: 8px;
    min-width: 60px;
    font-weight: bold;
  }

  .info-item .value {
    color: #eee;
    word-break: break-all;
  }

  /* 聊天界面样式 */
  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #333;
    border-radius: 6px;
    border: 1px solid #444;
    overflow: hidden;
    height: 100%;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .message {
    display: flex;
    margin-bottom: 16px;
  }

  .user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .ai-message {
    align-self: flex-start;
  }

  .message-avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    margin: 0 8px;
  }

  .avatar-icon {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: #444;
    font-size: 18px;
  }

  .user-message .avatar-icon {
    background-color: #7c3aed;
  }

  .ai-message .avatar-icon {
    background-color: #4b9ef9;
  }

  .message-content {
    max-width: 80%;
    background-color: #444;
    border-radius: 12px;
    padding: 12px;
    overflow: hidden;
  }

  .user-message .message-content {
    background-color: #7c3aed;
    border-top-right-radius: 0;
  }

  .ai-message .message-content {
    background-color: #3a3a3a;
    border-top-left-radius: 0;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .message-sender {
    font-weight: bold;
  }

  .message-time {
    color: rgba(255, 255, 255, 0.6);
  }

  .message-text {
    word-wrap: break-word;
    line-height: 1.4;
  }

  /* 让列表和段落有更好的间距 */
  .message-text p {
    margin: 8px 0;
  }

  .message-text ul,
  .message-text ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  .message-text li {
    margin-bottom: 4px;
  }

  .message-image {
    margin-bottom: 8px;
  }
  
  .image-container {
    position: relative;
    display: inline-block;
    overflow: hidden;
    border-radius: 6px;
  }
  
  .message-img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 6px;
    display: block;
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .image-container:hover .image-overlay {
    opacity: 1;
  }
  
  .image-action-btn {
    background: rgba(0, 0, 0, 0.6);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
    margin: 0 4px;
  }
  
  .image-action-btn:hover {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .expand-btn {
    width: 48px;
    height: 48px;
  }
  
  .top-right-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 8px;
  }
  
  /* 弹窗样式 */
  .image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
  }
  
  .modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .modal-image {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 8px;
  }
  
  .modal-close-btn {
    position: absolute;
    top: -20px;
    right: -20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .clickable-image {
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .clickable-image:hover {
    transform: scale(1.02);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  }

  .clickable-image::after {
    content: '点击复用此图片';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .clickable-image:hover::after {
    opacity: 1;
  }

  .chat-input-area {
    background-color: #2a2a2a;
    border-top: 1px solid #444;
    padding: 16px;
    flex-shrink: 0;
    position: relative;
    z-index: 10001 !important;
    pointer-events: auto !important;
  }

  .input-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-top: 8px;
  }

  .textarea-container {
    flex: 1;
    position: relative;
    height: 40px; 
    display: flex;
    align-items: center;
  }

  .textarea-container textarea {
    width: 100%;
    padding: 8px 12px;
    border-radius: 18px;
    background-color: #444;
    border: 1px solid #555;
    color: white;
    resize: none;
    height: 40px;
    line-height: 20px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box; 
  }

  .textarea-container textarea:focus {
    border-color: #7c3aed;
  }

  .upload-image-btn, .send-message-btn, .control-btn {
    min-width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: none;
    color: white;
    flex-shrink: 0; 
  }

  .upload-image-btn {
    background-color: #444;
    transition: background-color 0.2s;
  }

  .upload-image-btn:hover {
    background-color: #555;
  }

  .upload-image-btn:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .send-message-btn {
    background-color: #7c3aed;
    transition: background-color 0.2s;
  }

  .send-message-btn:hover {
    background-color: #6429d9;
  }

  .send-message-btn:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .image-actions {
    margin-top: 8px;
    display: flex;
    justify-content: center;
  }

  .apply-to-node-btn {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
  }

  .apply-to-node-btn:hover {
    background-color: #3e8e41;
  }

  .image-preview-area {
    margin-bottom: 8px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .preview-image-container {
    position: relative;
    display: inline-block;
  }

  .preview-image-small {
    max-width: 100px;
    max-height: 100px;
    border-radius: 6px;
    border: 1px solid #555;
  }

  .remove-image-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ff4d4f;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    cursor: pointer;
    border: none;
    font-weight: bold;
  }

  /* 加载指示器 */
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0;
    height: 24px;
  }

  .loading-text {
    margin-right: 8px;
    color: #fff;
  }

  .loading-dots {
    display: flex;
    gap: 4px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #7c3aed;
    margin: 0 4px;
    animation: bounce 1.5s infinite ease-in-out;
  }

  .dot:nth-child(1) {
    animation-delay: 0s;
  }

  .dot:nth-child(2) {
    animation-delay: 0.3s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .control-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: #e53e3e;
    border: none;
    color: white;
    transition: background-color 0.2s;
  }

  .control-btn:hover {
    background-color: #c53030;
  }

  .stop-btn {
    color: white;
  }

  /* 处理需要交互的元素避免被modal挡住 */
  .interactive-element {
    pointer-events: auto !important;
    position: relative;
    z-index: 10000 !important;
  }

  .action-btn {
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .action-btn:hover,
  .close-btn:hover {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.1);
  }

  /* 添加标签页样式 */
  .tab-navigation {
    display: flex;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 10px;
  }

  .tab-btn {
    padding: 8px 16px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: #666;
    transition: all 0.2s;
  }

  .flux-kontext-container {
    height: calc(100% - 50px);
    overflow-y: auto;
  }

  /* 可点击图片样式 */
  .clickable-image {
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .clickable-image:hover {
    transform: scale(1.02);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  }

  .clickable-image::after {
    content: '点击复用此图片';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .clickable-image:hover::after {
    opacity: 1;
  }
</style>
