import Cookies from 'js-cookie'
// API请求选项接口
export interface ChatApiOptions {
  model: string
  temperature: number
  top_p: number
  top_k: number
  frequency_penalty: number
  max_tokens: number
  prompt_id?: string
  request_id?: string
}

// 消息接口
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | ChatContent[]
}

// 消息内容接口
export interface ChatContent {
  type: 'text' | 'image_url'
  text?: string
  image_url?: {
    url: string
  }
}

// 流式回调接口
export interface StreamCallbacks {
  onStart?: () => void
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: any) => void
}

// 默认API选项
export const defaultApiOptions: ChatApiOptions = {
  model: 'Qwen/Qwen2.5-VL-72B-Instruct',
  temperature: 0.7,
  top_p: 0.7,
  top_k: 50,
  frequency_penalty: 0.5,
  max_tokens: 1024
}

// 服务器API路径
const SERVER_MODEL_API_URL = '/bizyair/model/chat'

/**
 * 构建聊天请求体
 * @param messages 消息数组
 * @param options API选项
 * @returns 请求体对象
 */
export function buildChatRequestBody(
  messages: ChatMessage[],
  options: Partial<ChatApiOptions> = {}
): any {
  const mergedOptions = { ...defaultApiOptions, ...options }
  return {
    model: mergedOptions.model,
    max_tokens: mergedOptions.max_tokens,
    temperature: mergedOptions.temperature,
    top_p: mergedOptions.top_p,
    top_k: mergedOptions.top_k,
    frequency_penalty: mergedOptions.frequency_penalty,
    n: 1,
    stop: [],
    messages: messages,
    prompt_id: mergedOptions.prompt_id,
    request_id: mergedOptions.request_id
  }
}

/**
 * 创建带有图片的用户消息
 * @param text 文本内容
 * @param imageBase64 图片的Base64编码（可以包含或不包含data:前缀）
 * @returns 用户消息对象
 */
export function createImageUserMessage(text: string, imageBase64: string): ChatMessage {
  // 确保imageBase64有正确的前缀
  const imageUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`

  return {
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: {
          url: imageUrl
        }
      },
      {
        type: 'text',
        text: text || '请描述一下这张图片'
      }
    ]
  }
}

/**
 * 创建纯文本用户消息
 * @param text 文本内容
 * @returns 用户消息对象
 */
export function createTextUserMessage(text: string): ChatMessage {
  return {
    role: 'user',
    content: text
  }
}

/**
 * 准备包含历史记录的消息数组用于API请求
 * @param currentMessage 当前消息
 * @returns Promise<ChatMessage[]>
 */
export async function prepareMessagesWithHistory(
  currentMessage: ChatMessage
): Promise<ChatMessage[]> {
  return [currentMessage]
}

/**
 * 处理流式响应
 * @param body 响应体流
 * @param callbacks 流式回调
 * @param signal 中止信号
 */
async function processStreamResponse(
  body: ReadableStream<Uint8Array>,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  // 如果提供了signal信号，监听中止事件
  if (signal) {
    signal.addEventListener('abort', () => {
      reader.cancel().catch(err => console.error('取消读取流出错:', err))
    })
  }

  try {
    callbacks.onStart?.()

    let isProcessing = true
    while (isProcessing) {
      // 检查是否已中止
      if (signal?.aborted) {
        reader.cancel().catch(err => console.error('取消读取流出错:', err))
        break
      }

      const { done, value } = await reader.read()
      if (done) {
        isProcessing = false
        break
      }

      buffer += decoder.decode(value, { stream: true })

      // 处理缓冲区中的所有完整行
      let lineEnd
      while ((lineEnd = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, lineEnd).trim()
        buffer = buffer.slice(lineEnd + 1)

        if (line.startsWith('data: ')) {
          const data = line.slice(6)

          // 检查是否是结束标记
          if (data === '[DONE]') {
            // 最终处理文本格式
            const formattedText = formatOutputText(fullText)
            callbacks.onComplete?.(formattedText)
            return
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.choices && parsed.choices[0]?.delta?.content !== undefined) {
              const content = parsed.choices[0].delta.content
              if (content) {
                fullText += content
                // 向UI回调发送当前token
                callbacks.onToken?.(content)
              }
            }
          } catch (e) {
            console.error('解析响应数据出错:', e, data)
          }
        }
      }
    }

    // 处理最后的缓冲区（如果有剩余内容）
    decoder.decode()
    const formattedText = formatOutputText(fullText)
    callbacks.onComplete?.(formattedText)
  } catch (error: any) {
    console.error('处理流式响应时出错:', error)
    callbacks.onError?.(error)
  }
}

/**
 * 发送流式聊天请求
 * @param messages 消息数组或单条消息
 * @param callbacks 流式回调
 * @param options API选项
 * @returns 用于中止请求的AbortController
 */
export async function sendStreamChatRequest(
  messages: ChatMessage[] | ChatMessage,
  callbacks: StreamCallbacks,
  options: Partial<ChatApiOptions> = {}
): Promise<AbortController> {
  // 如果传入的是单条消息，则添加历史记录
  let messagesArray: ChatMessage[]
  if (!Array.isArray(messages)) {
    messagesArray = await prepareMessagesWithHistory(messages)
  } else {
    messagesArray = messages
  }

  const filteredMessages = messagesArray.map(message => {
    const filteredMessage = { ...message }
    if (Array.isArray(filteredMessage.content)) {
      const textContents = filteredMessage.content.filter(item => item.type === 'text')
      if (textContents.length > 0 && textContents[0].text) {
        filteredMessage.content = textContents[0].text
      } else {
        filteredMessage.content = ''
      }
    }

    return filteredMessage
  })
  const requestBody = buildChatRequestBody(filteredMessages, options)

  requestBody.stream = true

  const abortController = new AbortController()

  try {
    // 通知开始
    callbacks.onStart?.()

    const response = await fetch(SERVER_MODEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cookies.get('bizy_token') || '',
        ...(options as any)?.headers
      },
      body: JSON.stringify(requestBody),
      signal: abortController.signal // 添加中止信号
    })

    if (!response.ok) {
      throw new Error(`HTTP错误: [${response.status}] ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('响应体为空')
    }

    // 处理流式响应
    processStreamResponse(response.body, callbacks, abortController.signal)
  } catch (error: any) {
    // 检查是否是由于中止导致的错误
    if (error.name === 'AbortError') {
      console.log('请求已中止')
      callbacks.onComplete?.('') // 中止时清空并完成
    } else {
      console.error('API请求错误:', error)
      callbacks.onError?.(error)
    }
  }

  return abortController // 返回控制器供外部使用
}

/**
 * 将base64数据转换为File对象
 * @param base64Data base64数据（可以包含前缀）
 * @param fileName 文件名
 * @param mimeType MIME类型
 * @returns File对象
 */
export function base64ToFile(
  base64Data: string,
  fileName: string,
  mimeType: string = 'image/png'
): File {
  // 如果包含前缀，则去除前缀
  const base64Content = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data

  // 将base64解码为二进制数据
  const byteCharacters = atob(base64Content)
  const byteArrays: Uint8Array[] = []

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: mimeType })
  return new File([blob], fileName, { type: mimeType })
}

/**
 * 格式化模型输出文本，保留换行和格式
 * @param text 原始模型输出文本
 * @returns 格式化后的HTML文本
 */
export function formatOutputText(text: string): string {
  if (!text) return ''

  // 记录处理前的文本用于调试
  console.log('格式化前的原始文本:', text)

  // 替换井号标记（如 "###"，"####"等）
  text = text.replace(/^(#{1,6})\s+(.+)$/gm, (hashes, content) => {
    const level = Math.min(hashes.length, 6)

    return `<div class="markdown-heading level-${level}">${content}</div>`
  })

  text = text.replace(/#(\S+?)(?=#|\s|$)/g, (match, tagContent) => {
    if (tagContent.includes('<') && !tagContent.includes('>')) {
      return match
    }
    return `<span class="tag">#${tagContent}</span>`
  })

  // 替换加粗文本
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // 替换换行符为HTML换行标签
  text = text.replace(/\n/g, '<br>')

  // 去除连续的<br>标签
  text = text.replace(/<br><br><br>/g, '<br><br>')

  // 记录处理后的文本用于调试
  console.log('格式化后的HTML文本:', text)

  return text
}

/**
 * 轻量级实时格式化文本函数，用于流式输出时的格式化
 * @param text 原始模型输出文本
 * @returns 格式化后的HTML文本
 */
export function formatOutputTextLight(text: string): string {
  if (!text) return ''

  // 基本的Markdown格式转换
  let formatted = text

  // 处理标题格式
  formatted = formatted.replace(/^(#{1,6})\s+(.+)$/gm, (hashes, content) => {
    const level = Math.min(hashes.length, 6)
    return `<div class="markdown-heading level-${level}">${content}</div>`
  })

  // 处理中文标签格式
  formatted = formatted.replace(/#(\S+?)(?=#|\s|$)/g, (match, tagContent) => {
    if (tagContent.includes('<') && !tagContent.includes('>')) {
      return match
    }
    return `<span class="tag">#${tagContent}</span>`
  })

  // 替换加粗文本
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // 替换换行符为HTML换行标签
  formatted = formatted.replace(/\n/g, '<br>')

  return formatted
}

/**
 * 生成图像
 * @param options 图像生成选项
 * @returns Promise<string> 返回生成的图像URL
 */
export async function generateImage(options: {
  prompt: string
  n?: number
  size?: string
  model?: string
  loading_callback?: (loading: boolean) => void
  error_callback?: (error: any) => void
}): Promise<string> {
  const { prompt, loading_callback, error_callback } = options

  try {
    loading_callback?.(true)

    const response = await fetch('/bizyair/model/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cookies.get('bizy_token') || '',
        ...(options as any)?.headers
      },
      body: JSON.stringify({
        prompt: prompt,
        n: options.n || 1,
        model: options.model || 'Kwai-Kolors/Kolors',
        size: options.size || '1024x1024'
      })
    })

    if (!response.ok) {
      throw new Error(`图像生成API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('图像生成成功:', data)

    // 返回生成的图像URL
    if (data.data) {
      return data.data.images[0].url
    } else {
      throw new Error('API返回的数据中没有图像URL')
    }
  } catch (error) {
    console.error('生成图像时出错:', error)
    error_callback?.(error)
    throw error
  } finally {
    loading_callback?.(false)
  }
}

/**
 * 编辑图片
 * @param prompt 提示词
 * @param imageBase64 图片base64数据
 * @param signal 可选的AbortSignal，用于取消请求
 * @returns Promise<string> 返回生成的图片URL
 */
export async function handleImageWithKontextPro(
  prompt: string,
  imageBase64: string,
  options: Record<string, any> = {}
) {
  try {
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new Error('图片数据无效')
    }
    let imageData = imageBase64
    if (!imageBase64.startsWith('data:')) {
      imageData = `data:image/webp;base64,${imageBase64}`
    }
    const requestBody = {
      model: 'flux-kontext-dev',
      prompt: prompt || '',
      image: imageData,
      stream: false
    }

    const response = await fetch('/bizyair/model/image-edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cookies.get('bizy_token') || '',
        ...(options as any)?.headers
      },
      body: JSON.stringify(requestBody)
    })
    if (!response.ok) {
      throw new Error(`HTTP错误: [${response.status}] ${response.statusText}`)
    }
    const responseData = await response.json()

    if (responseData.code === 20000 && responseData.data) {
      const data = responseData.data

      if (data.result && typeof data.result === 'string') {
        try {
          const resultJson = JSON.parse(data.result)
          if (resultJson.outputs) {
            const outputs = resultJson.outputs
            const outputKeys = Object.keys(outputs)
            const firstKey = outputKeys[0]
            const outputArray = outputs[firstKey]
            const imageUrl = outputArray.outputs[0]
            return imageUrl
          }
        } catch (error) {
          console.error('解析result字段失败:', error)
        }
      }
    } else {
      console.error('API响应格式不符合预期:', responseData)
      const statusCode = responseData.code || ''
      const errorMsg = responseData.message || ''
      throw new Error(`API响应错误: [${statusCode}] ${errorMsg}`)
    }
  } catch (error: any) {
    const errorMessage = {
      code: 50000,
      message: error.message,
      data: null
    }
    throw errorMessage
  }
}
