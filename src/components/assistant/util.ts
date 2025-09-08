import Cookies from 'js-cookie'
import MarkdownIt from 'markdown-it'
import { FilterXSS } from 'xss'
// API请求选项接口
export interface ChatApiOptions {
  model_config?: {
    temperature?: number
    max_tokens?: number
    top_p?: number
    top_k?: number
    frequency_penalty?: number
  }
}

// 消息接口 - 支持新的对话历史格式
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | ChatContent[]
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

// 工具调用接口
export interface ToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
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
  onConversationId?: (conversationId: string) => void
  onToolCall?: (tool: { id?: string; name: string; arguments: string; type?: string }) => void
  onToolResult?: (result: { tool_call_id?: string; result: any; server_name?: string }) => void
}

// 默认API选项
export const defaultApiOptions: ChatApiOptions = {
  model_config: {
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.7,
    top_k: 50,
    frequency_penalty: 0.5
  }
}

// 服务器API路径
const SERVER_MODEL_API_URL = '/bizyair/model/chat'

// Markdown 渲染与 XSS 过滤器
const mdParser = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

const xssFilter = new FilterXSS({
  whiteList: {
    a: ['href', 'title', 'target', 'rel'],
    p: [],
    br: [],
    hr: [],
    strong: [],
    b: [],
    em: [],
    i: [],
    code: [],
    pre: [],
    ul: [],
    ol: [],
    li: [],
    blockquote: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    table: ['border', 'cellpadding', 'cellspacing'],
    thead: [],
    tbody: [],
    tr: [],
    th: [],
    td: [],
    del: [],
    sup: [],
    sub: []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style']
})

function renderMarkdownSafely(text: string): string {
  if (!text) return ''
  const html = mdParser.render(text)
  return xssFilter.process(html)
}

/**
 * 构建聊天请求体
 * @param message 当前消息内容（可选，如果只发送历史则为空）
 * @param conversationHistory 对话历史
 * @param options API选项
 * @returns 请求体对象
 */
export function buildChatRequestBody(
  message: string | null,
  conversationHistory: ChatMessage[] = [],
  options: Partial<ChatApiOptions> = {}
): any {
  const requestBody: any = {
    conversation_history: conversationHistory,
    model_config: {
      ...defaultApiOptions.model_config,
      ...options.model_config
    }
  }

  // 如果有新消息，则添加到请求体中
  if (message && message.trim()) {
    requestBody.message = message
  }

  return requestBody
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
            const parsed: any = JSON.parse(data)

            // 新版事件流格式处理
            if (parsed && typeof parsed === 'object' && parsed.type) {
              switch (parsed.type) {
                case 'conversation_started': {
                  if (parsed.conversation_id && callbacks.onConversationId) {
                    callbacks.onConversationId(parsed.conversation_id)
                  }
                  break
                }
                case 'content_delta': {
                  const content: string | undefined = parsed.content
                  if (typeof content === 'string' && content.length > 0) {
                    fullText += content
                    callbacks.onToken?.(content)
                  }
                  break
                }
                // 旧版 final_content_delta 已废弃，统一使用 content_delta
                case 'tool_calls': {
                  const toolCalls = parsed.tool_calls
                  if (Array.isArray(toolCalls)) {
                    for (const tc of toolCalls) {
                      const name = tc?.function?.name || tc?.name || ''
                      const args = tc?.function?.arguments || tc?.arguments || ''
                      const id = tc?.id
                      callbacks.onToolCall?.({ id, name, arguments: String(args), type: tc?.type })
                    }
                  }
                  break
                }
                case 'tool_result': {
                  callbacks.onToolResult?.({
                    tool_call_id: parsed.tool_call_id,
                    result: parsed.result,
                    server_name: parsed.server_name
                  })
                  break
                }
                case 'done': {
                  const formattedText = formatOutputText(fullText)
                  callbacks.onComplete?.(formattedText)
                  return
                }
                default: {
                  // 忽略未知的type，或在此加入日志
                  break
                }
              }
              // 已按新版格式处理，继续读取下一行
              continue
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
 * @param message 消息内容（字符串、ChatMessage对象或null）
 * @param conversationHistory 对话历史
 * @param callbacks 流式回调
 * @param options API选项
 * @returns 用于中止请求的AbortController
 */
export async function sendStreamChatRequest(
  message: string | ChatMessage | null,
  conversationHistory: ChatMessage[],
  callbacks: StreamCallbacks,
  options: Partial<ChatApiOptions> = {}
): Promise<AbortController> {
  // 提取消息文本内容
  let messageText: string | null = null

  if (typeof message === 'string') {
    messageText = message
  } else if (message && typeof message === 'object') {
    // 如果是ChatMessage对象，提取文本内容
    if (Array.isArray(message.content)) {
      const textContents = message.content.filter(item => item.type === 'text')
      if (textContents.length > 0 && textContents[0].text) {
        messageText = textContents[0].text
      }
    } else {
      messageText = message.content
    }
  }

  const requestBody = buildChatRequestBody(messageText, conversationHistory, options)
  console.log('requestBody', requestBody)
  const abortController = new AbortController()

  try {
    // 通知开始
    callbacks.onStart?.()

    const Authorization = (window as any).bizyAirAuthorization || Cookies.get('bizy_token') || ''

    const response = await fetch(SERVER_MODEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization,
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
 * 格式化模型输出文本，保留换行和格式
 * @param text 原始模型输出文本
 * @returns 格式化后的HTML文本
 */
export function formatOutputText(text: string): string {
  if (!text) return ''

  // 检查是否包含Markdown语法
  const hasMarkdown =
    /[*_`#[\]()!-]/.test(text) ||
    text.includes('\n\n') ||
    text.includes('- ') ||
    text.includes('* ')

  if (hasMarkdown) {
    return renderMarkdownSafely(text)
  } else {
    // 对于纯文本，只进行换行转换
    return text.replace(/\n/g, '<br>')
  }
}

/**
 * 轻量级实时格式化文本函数，用于流式输出时的格式化
 * @param text 原始模型输出文本
 * @returns 格式化后的HTML文本
 */
export function formatOutputTextLight(text: string): string {
  if (!text) return ''

  // 直接返回纯文本，让Vue模板处理显示
  // 只进行基本的换行转换，不进行HTML转义
  return text.replace(/\n/g, '<br>')
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
 * 将前端消息格式转换为API所需的对话历史格式
 * @param messages 前端消息数组
 * @returns API格式的对话历史
 */
export function convertToApiHistory(messages: any[]): ChatMessage[] {
  const apiHistory: ChatMessage[] = []

  for (const msg of messages) {
    if (msg.role === 'user') {
      // 处理用户消息
      if (msg.hasImage && (msg.image || msg.images)) {
        // 带图片的消息 - 将图片URL作为文本内容的一部分
        let textContent = msg.content || ''

        // 收集所有图片URL
        const imageUrls: string[] = []
        if (msg.images && msg.images.length > 0) {
          imageUrls.push(...msg.images)
        } else if (msg.image) {
          imageUrls.push(msg.image)
        }

        // 将图片URL添加到文本内容中
        if (imageUrls.length > 0) {
          const imageUrlsText = imageUrls.map(url => `图片地址：${url}`).join('\n')
          textContent = textContent ? `${textContent}\n\n${imageUrlsText}` : imageUrlsText
        }

        apiHistory.push({
          role: 'user',
          content: textContent
        })
      } else {
        // 纯文本消息
        apiHistory.push({
          role: 'user',
          content: msg.content || msg.rawText || ''
        })
      }
    } else if (msg.role === 'assistant') {
      // 处理助手消息（支持多轮工具事件）
      const stripHtml = (s: string) => (s && s.includes('<') ? s.replace(/<[^>]*>/g, '').trim() : s || '')

      // 新版：存在 toolEvents 时，按事件序列展开
      if (Array.isArray(msg.toolEvents) && msg.toolEvents.length > 0) {
        let pendingText = ''

        const flushPendingText = () => {
          const cleaned = stripHtml(pendingText)
          if (cleaned) {
            apiHistory.push({
              role: 'assistant',
              content: cleaned
            })
          }
          pendingText = ''
        }

        for (const ev of msg.toolEvents as any[]) {
          if (ev && ev.type === 'text') {
            pendingText += ev.text || ''
          } else if (ev && ev.type === 'tool') {
            // 在工具调用前输出累积文本
            flushPendingText()
            const toolId = ev.id || undefined
            const toolName = ev.name || 'unknown_tool'
            const toolArgs = typeof ev.arguments === 'string' ? ev.arguments : JSON.stringify(ev.arguments || '')

            // assistant 消息携带 tool_calls
            apiHistory.push({
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  id: toolId || toolName,
                  type: 'function',
                  function: {
                    name: toolName,
                    arguments: toolArgs
                  }
                }
              ]
            })

            // tool 结果
            if (ev.resultText) {
              apiHistory.push({
                role: 'tool',
                content: ev.resultText,
                tool_call_id: toolId || toolName
              })
            }
          }
        }

        // 事件结束后如果还有文本，输出为assistant消息
        flushPendingText()
      } else {
        // 旧版：保留原有单次工具调用兼容逻辑
        let assistantContent = ''
        if (msg.toolName && msg.preToolContent) {
          assistantContent = stripHtml(msg.preToolContent)
        } else {
          assistantContent = stripHtml(msg.content || msg.rawText || '')
        }

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: assistantContent
        }

        if (msg.toolName && msg.toolId && msg.toolCallArgs) {
          assistantMsg.tool_calls = [
            {
              id: msg.toolId,
              type: 'function',
              function: {
                name: msg.toolName,
                arguments: msg.toolCallArgs
              }
            }
          ]
        }
        apiHistory.push(assistantMsg)

        if (msg.toolResultText && msg.toolId) {
          apiHistory.push({
            role: 'tool',
            content: msg.toolResultText,
            tool_call_id: msg.toolId
          })
        }

        if (msg.toolName && msg.postToolContent) {
          const postContent = stripHtml(msg.postToolContent)
          if (postContent) {
            apiHistory.push({
              role: 'assistant',
              content: postContent
            })
          }
        }
      }
    }
  }

  return apiHistory
}
