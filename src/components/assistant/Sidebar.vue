<template>
  <Teleport to="body">
    <div class="sidebar-wrapper" v-if="sidebarStore.isOpen" :style="{ width: `${sidebarWidth}px` }">
      <div class="resize-handle" @mousedown="startResize"></div>
      <div class="sidebar-header">
        <h2>{{ $t('sidebar.assistant.title') }}</h2>
        <div class="header-actions">
          <button class="action-btn" @click="clearHistory" title="清空对话历史">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
          <button class="close-btn" @click="sidebarStore.closeSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="sidebar-content">
        <div class="chat-container">
          <div class="chat-messages" ref="chatMessagesRef">
            <div v-for="(message, index) in chatMessages" :key="index"
              :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
              <div class="message-avatar">
                <div class="avatar-icon">
                  {{ message.role === 'user' ? '👤' : '🤖' }}
                </div>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-sender">{{ message.role === 'user' ? '' : $t('sidebar.assistant.title') }}</span>
                  <span class="message-time">{{ message.time }}</span>
                </div>

                <!-- 图片消息 -->
                <div v-if="message.hasImage" class="message-image">
                  <img :src="message.image" alt="用户上传图片" />
                </div>

                <!-- 文本消息 -->
                <div class="message-text" v-html="message.content"></div>
              </div>
            </div>

            <!-- 加载指示器 -->
            <div v-if="isLoading" class="loading-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="chat-input-area">
            <div v-if="sidebarStore?.nodeInfo" style="display: flex; justify-content: space-around;">   
              <div class="info-item" >
                <span class="label">{{ $t('sidebar.assistant.nodeName') }}:</span>
                <span class="value">{{ sidebarStore.nodeInfo.title }}</span>
              </div>
              <div class="info-item" >
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
              <button class="upload-image-btn" @click="triggerImageUpload" :disabled="isLoading" :title="$t('sidebar.assistant.uploadImage')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14L6 17h12l-3.86-5.14z" />
                </svg>
              </button>

              <div class="textarea-container">
                <textarea v-model="userInput" :placeholder="$t('sidebar.assistant.inputPlaceholder')" @keydown.enter.prevent="sendMessage"
                  ref="textareaRef" :disabled="isLoading"></textarea>
              </div>

              <!-- 发送/中止按钮 -->
              <!-- <button 
                :class="['message-btn', isLoading ? 'abort-message-btn' : 'send-message-btn']" 
                @click="isLoading ? abortGeneration() : sendMessage()" 
                :disabled="!isLoading && !canSendMessage"
                :title="isLoading ? $t('sidebar.assistant.abortGeneration') : $t('sidebar.assistant.sendMessage')"
              > -->
              <button 
                :class="['message-btn', isLoading ? 'abort-message-btn' : 'send-message-btn']" 
                @click="isLoading ? abortGeneration() : sendMessage2()" 
                :disabled="!isLoading && !canSendMessage"
                :title="isLoading ? $t('sidebar.assistant.abortGeneration') : $t('sidebar.assistant.sendMessage')"
              >
                <!-- 发送图标 -->
                <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2l.01 7z" />
                </svg>
                <!-- 停止图标 -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 6h12v12H6z" />
                </svg>
              </button>
            </div>

            <input type="file" ref="imageInputRef" style="display: none" accept="image/*" @change="handleImageUpload" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebarStore'
import { onMounted, watch, ref, computed, onBeforeUnmount } from 'vue';
import { 
  sendStreamChatRequest, 
  createTextUserMessage, 
  createImageUserMessage,
  ChatMessage,
  formatOutputText
} from './util';
import {
  saveMessage,
  clearAllMessages,
  getRecentMessages,
  convertToStoredMessage
} from './database';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const sidebarStore = useSidebarStore()
//'// 拖拽调整大小---------------------------------------'
// 侧边栏宽度相关变量
const sidebarWidth = ref(550); // 默认宽度
const minWidth = 50;  // 最小宽度
const maxWidth = 1300;  // 最大宽度
const isResizing = ref(false);

// 开始拖拽
const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  // 防止选中文本
  e.preventDefault();
};


const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return;
  
  // 计算宽度 (窗口宽度 - 鼠标位置)
  const newWidth = window.innerWidth - e.clientX;
  
  // 限制宽度范围
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    sidebarWidth.value = newWidth;
    // 可选：保存宽度到本地存储
    localStorage.setItem('bizyair-sidebar-width', newWidth.toString());
  }
};

// 停止拖拽
const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
};

// 组件卸载前清理事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
});
'---------------------------------------'

// 聊天相关状态
const chatMessages = ref<Array<{
  role: 'user' | 'assistant',
  content: string,
  time: string,
  hasImage?: boolean,
  image?: string
}>>([]);
const userInput = ref('');
const isLoading = ref(false);
const previewImage = ref('');
const uploadedImageBase64 = ref('');
const chatMessagesRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
// 添加请求中止控制器
const abortController = ref<AbortController | null>(null);

// 计算属性：是否可以发送消息
const canSendMessage = computed(() => {
  return userInput.value.trim() !== '' || previewImage.value !== '';
});

// 获取当前时间格式化字符串
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 触发图片上传
const triggerImageUpload = () => {
  if (imageInputRef.value) {
    imageInputRef.value.click();
  }
};

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert(t('sidebar.assistant.imageUploadError'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      previewImage.value = result;
      uploadedImageBase64.value = result.split(',')[1]; // 去掉 data:image/png;base64, 前缀
    };
    reader.readAsDataURL(file);
  }
};

// 移除已选图片
const removeImage = () => {
  previewImage.value = '';
  uploadedImageBase64.value = '';
  if (imageInputRef.value) {
    imageInputRef.value.value = '';
  }
};

// 添加对话历史相关功能按钮
const clearHistory = async () => {
  try {
    // 清空数据库中的历史记录
    await clearAllMessages();
    
    // 创建一个新的欢迎消息
    const welcomeMessage = {
      role: 'assistant' as const,
      content: t('sidebar.assistant.welcomeMessage'),
      time: getCurrentTime()
    };
    
    // 更新UI显示
    chatMessages.value = [welcomeMessage];
    
    // 将欢迎消息保存到数据库中，这样可以避免第一条消息重复发送
    const storedWelcomeMessage = convertToStoredMessage(welcomeMessage);
    await saveMessage(storedWelcomeMessage);
    
    console.log('历史记录已清空，并添加了欢迎消息');
  } catch (error) {
    console.error('清空历史失败:', error);
  }
};

// 中止生成
const abortGeneration = () => {
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
    isLoading.value = false;
    console.log('已手动中止生成');
  }
};


const sendMessage2=async function unsafeGenerateImage(prompt: any) {
  const apiKey = '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'; // 此处会暴露密钥！
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt:'一个蓝色的天空，有一群大雁在飞',
      size: "1024x1024",
      n: 1
    })
  });

  const data = await response.json();
  console.log(data,'data______________');
  
  console.log(data.data[0].url); // 图片URL
}
// 修改发送消息函数
const sendMessage = async () => {
  if (!canSendMessage.value || isLoading.value) return;
  
  const currentTime = getCurrentTime();
  // 创建用户消息
  const userMessage = {
    role: 'user' as const,
    content: userInput.value,
    time: currentTime,
    hasImage: !!previewImage.value,
    image: previewImage.value
  };
  
  // 添加用户消息到UI聊天记录
  chatMessages.value.push(userMessage);
  
  // 滚动到底部
  setTimeout(() => {
    scrollToBottom();
  }, 0);
  
  // 准备API请求
  const messageText = userInput.value;
  const hasImage = !!uploadedImageBase64.value;
  
  // 清空输入
  userInput.value = '';
  const imageBase64 = uploadedImageBase64.value;
  removeImage();
  
  // 显示加载状态
  isLoading.value = true;
  
  // 稍后将用于存储AI回复消息的索引
  let aiMessageIndex = -1;
  
  try {
    // 创建消息对象供API使用
    let message: ChatMessage;
    if (hasImage) {
      message = createImageUserMessage(messageText, imageBase64);
    } else {
      message = createTextUserMessage(messageText);
    }
    
    // 保存已收到的完整文本
    let receivedText = '';
    let hasReceivedFirstToken = false;
    let userMessageSaved = false; // 标记用户消息是否已保存
    
    // 发送流式请求并保存中止控制器
    abortController.value = await sendStreamChatRequest(
      message,
      {
        onStart: () => {
          console.log('开始接收流式响应');
        },
        onToken: async (token) => {
          // 第一次收到token时，先保存用户消息到数据库
          if (!hasReceivedFirstToken) {
            hasReceivedFirstToken = true;
            
            // 创建AI消息框
            aiMessageIndex = chatMessages.value.length;
            chatMessages.value.push({
              role: 'assistant',
              content: '',
              time: getCurrentTime()
            });
            
            // 在收到第一个token后再保存用户消息到数据库
            if (!userMessageSaved) {
              userMessageSaved = true;
              const storedUserMessage = convertToStoredMessage(userMessage);
              try {
                await saveMessage(storedUserMessage);
                console.log('用户消息保存成功');
              } catch (error) {
                console.error('保存用户消息失败:', error);
              }
            }
          }
          
          // 累积收到的文本
          receivedText += token;
          
          // 更新聊天消息内容，应用格式化
          if (aiMessageIndex >= 0 && aiMessageIndex < chatMessages.value.length) {
            const formattedText = formatOutputText(receivedText);
            chatMessages.value[aiMessageIndex].content = formattedText;
          }
          
          // 滚动到底部
          scrollToBottom();
        },
        onComplete: async (fullText) => {
          console.log('流式响应完成:', fullText);
          isLoading.value = false;
          abortController.value = null;
          
          // 如果从未收到任何token，但是有完整响应，显示一个消息
          if (!hasReceivedFirstToken && fullText) {
            // 在这种情况下也需要保存用户消息
            if (!userMessageSaved) {
              userMessageSaved = true;
              const storedUserMessage = convertToStoredMessage(userMessage);
              try {
                await saveMessage(storedUserMessage);
                console.log('用户消息保存成功');
              } catch (error) {
                console.error('保存用户消息失败:', error);
              }
            }
            
            aiMessageIndex = chatMessages.value.length;
            const formattedText = formatOutputText(fullText);
            chatMessages.value.push({
              role: 'assistant',
              content: formattedText,
              time: getCurrentTime()
            });
          }
          
          // 保存AI响应到数据库
          if (aiMessageIndex >= 0 && aiMessageIndex < chatMessages.value.length) {
            const assistantMessage = chatMessages.value[aiMessageIndex];
            const storedAssistantMessage = convertToStoredMessage(assistantMessage);
            await saveMessage(storedAssistantMessage);
          }
        },
        onError: async (error) => {
          console.error('流式响应错误:', error);
          isLoading.value = false;
          abortController.value = null;
          
          // 即使出错也要保存用户消息，确保对话连贯性
          if (!userMessageSaved) {
            userMessageSaved = true;
            const storedUserMessage = convertToStoredMessage(userMessage);
            try {
              await saveMessage(storedUserMessage);
              console.log('用户消息保存成功');
            } catch (error) {
              console.error('保存用户消息失败:', error);
            }
          }
          
          // 添加错误消息
          chatMessages.value.push({
            role: 'assistant',
            content: t('sidebar.assistant.errorMessage'),
            time: getCurrentTime()
          });
        }
      }
    );
  } catch (error) {
    console.error('API请求错误:', error);
    isLoading.value = false;
    abortController.value = null;
    
    // 即使API请求出错也保存用户消息
    const storedUserMessage = convertToStoredMessage(userMessage);
    try {
      await saveMessage(storedUserMessage);
      console.log('用户消息保存成功');
    } catch (saveError) {
      console.error('保存用户消息失败:', saveError);
    }
    
    // 添加错误消息
    chatMessages.value.push({
      role: 'assistant',
      content: t('sidebar.assistant.errorMessage'),
      time: getCurrentTime()
    });
  } finally {
    // 滚动到底部
    setTimeout(() => {
      scrollToBottom();
    }, 0);
  }
};

// 滚动到聊天底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// 修改watch函数，不再添加消息到聊天
watch(() => sidebarStore.nodeInfo, (newValue) => {
  console.log('节点信息更新:', newValue);
  if (newValue && newValue.imageInfo && (newValue.imageInfo.url || newValue.imageInfo.base64)) {
    // 直接设置预览图片，就像用户上传了一样
    const imageUrl = newValue.imageInfo.base64 || newValue.imageInfo.url;
    
    // 设置上传的图片以便用户可以输入文本后发送
    previewImage.value = imageUrl;
    
    // 处理base64数据
    if (newValue.imageInfo.base64) {
      // 检查是否已包含data:前缀
      if (typeof newValue.imageInfo.base64 === 'string') {
        if (newValue.imageInfo.base64.startsWith('data:')) {
          // 如果包含前缀，则提取纯base64部分
          uploadedImageBase64.value = newValue.imageInfo.base64.split(',')[1];
        } else {
          // 已经是纯base64，直接使用
          uploadedImageBase64.value = newValue.imageInfo.base64;
        }
      }
    } else if (newValue.imageInfo.url) {
      // 如果没有base64，则尝试从URL加载并转换
      fetch(newValue.imageInfo.url)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            if (typeof base64data === 'string') {
              uploadedImageBase64.value = base64data.split(',')[1]; // 移除data:image/...前缀
            }
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => console.error('获取图片出错:', error));
    }
    
    // 聚焦到输入框
    setTimeout(() => {
      if (textareaRef.value) {
        textareaRef.value.focus();
      }
    }, 0);
  }
}, { deep: true });

onMounted(async () => {
  // 从本地存储加载宽度设置
  const savedWidth = localStorage.getItem('bizyair-sidebar-width');
  if (savedWidth) {
    const width = parseInt(savedWidth);
    if (width >= minWidth && width <= maxWidth) {
      sidebarWidth.value = width;
    }
  }
  
  try {
    // 尝试从IndexedDB加载历史消息
    const recentMessages = await getRecentMessages(10); // 最多显示10条历史消息
    
    if (recentMessages && recentMessages.length > 0) {
      // 转换存储的消息为UI展示格式
      const uiMessages = recentMessages.map(msg => {
        let content = '';
        let hasImage = false;
        let image = '';
        
        // 处理不同格式的消息内容
        if (typeof msg.content === 'string') {
          content = msg.content;
        } else if (Array.isArray(msg.content)) {
          // 查找文本和图片内容
          const textContent = msg.content.find(item => item.type === 'text');
          const imageContent = msg.content.find(item => item.type === 'image_url');
          
          if (textContent && textContent.text) {
            content = textContent.text;
          }
          
          if (imageContent && imageContent.image_url && imageContent.image_url.url) {
            hasImage = true;
            image = imageContent.image_url.url;
          }
        }
        
        return {
          role: msg.role as 'user' | 'assistant',
          content: content,
          time: new Date(msg.timestamp).toTimeString().slice(0, 5),
          hasImage: hasImage,
          image: image
        };
      });
      
      // 添加历史消息到聊天UI
      chatMessages.value = uiMessages;
      
      // 如果有历史消息，则不显示欢迎消息
      console.log('从数据库加载了', uiMessages.length, '条历史消息');
      return;
    }
  } catch (error) {
    console.error('加载历史消息失败:', error);
  }
  
  // 如果没有历史消息或加载失败，显示欢迎消息并保存到数据库
  const welcomeMessage = {
    role: 'assistant' as const,
    content: t('sidebar.assistant.welcomeMessage'),
    time: getCurrentTime()
  };
  
  chatMessages.value.push(welcomeMessage);
  
  // 将欢迎消息保存到数据库
  try {
    const storedWelcomeMessage = convertToStoredMessage(welcomeMessage);
    await saveMessage(storedWelcomeMessage);
    console.log('初始欢迎消息已保存到数据库');
  } catch (error) {
    console.error('保存欢迎消息失败:', error);
  }
});
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
  max-width: 70%;
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

.message-image img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
}

.chat-input-area {
  background-color: #2a2a2a;
  border-top: 1px solid #444;
  padding: 16px;
  flex-shrink: 0;
}

.input-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.textarea-container {
  flex: 1;
  position: relative;
}

.textarea-container textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 18px;
  background-color: #444;
  border: 1px solid #555;
  color: white;
  resize: none;
  height: 40px;
  line-height: 20px;
  outline: none;
  transition: border-color 0.2s;
}

.textarea-container textarea:focus {
  border-color: #7c3aed;
}

.upload-image-btn,
.send-message-btn,
.message-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #444;
  border: none;
  color: white;
  transition: background-color 0.2s;
}

.upload-image-btn:hover,
.send-message-btn:hover,
.message-btn:hover {
  background-color: #555;
}

.send-message-btn {
  background-color: #7c3aed;
}

.send-message-btn:hover {
  background-color: #6429d9;
}

.abort-message-btn {
  background-color: #e53e3e;
}

.abort-message-btn:hover {
  background-color: #c53030;
}

.send-message-btn:disabled,
.message-btn:disabled,
.upload-image-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

.image-preview-area {
  margin-bottom: 12px;
  flex-shrink: 0;
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
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 