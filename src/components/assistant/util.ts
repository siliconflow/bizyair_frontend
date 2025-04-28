// API请求相关接口和工具函数
import {
  getRecentMessages,
} from './database';

// API请求选项接口
export interface ChatApiOptions {
  model: string;
  temperature: number;
  top_p: number;
  top_k: number;
  frequency_penalty: number;
  max_tokens: number;
  apiKey: string;
}

// 图像生成选项接口
export interface ImageGenOptions {
  model: string;
  prompt: string;
  size: string;
  quality: string;
  n: number;
  apiKey: string;
  messages?: any[]; // 添加messages参数
}

// 图像编辑选项接口
export interface ImageEditOptions {
  model: string;
  prompt: string;
  size: string;
  n: number;
  apiKey: string;
}

// 消息接口
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ChatContent[];
}

// 消息内容接口
export interface ChatContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

// 流式回调接口
export interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: any) => void;
}

// 图像生成回调接口
export interface ImageCallbacks {
  onStart?: () => void;
  onComplete?: (imageBase64: string) => void;
  onError?: (error: any) => void;
}

// 默认API选项
export const defaultApiOptions: ChatApiOptions = {
  model: "Qwen/Qwen2.5-VL-32B-Instruct",
  temperature: 0.7,
  top_p: 0.7,
  top_k: 50,
  frequency_penalty: 0,
  max_tokens: 4096,
  apiKey: "" // 请注意：实际项目中应通过环境变量或安全的方式管理API密钥
};

// 默认图像生成选项
export const defaultImageGenOptions: ImageGenOptions = {
  model: "gpt-image-1",
  prompt: "",
  size: "1024x1024",
  quality: "medium",
  n: 1,
  apiKey: ""
};

// 默认图像编辑选项
export const defaultImageEditOptions: ImageEditOptions = {
  model: "gpt-image-1",
  prompt: "",
  size: "1024x1024",
  n: 1,
  apiKey: ""
};

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
  const mergedOptions = { ...defaultApiOptions, ...options };
  return {
    model: mergedOptions.model,
    stream: true,
    max_tokens: mergedOptions.max_tokens,
    temperature: mergedOptions.temperature,
    top_p: mergedOptions.top_p,
    top_k: mergedOptions.top_k,
    frequency_penalty: mergedOptions.frequency_penalty,
    n: 1,
    stop: [],
    messages: messages
  };
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
    : `data:image/png;base64,${imageBase64}`;

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
        text: text || "请描述一下这张图片"
      }
    ]
  };
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
  };
}

/**
 * 准备包含历史记录的消息数组用于API请求
 * @param currentMessage 当前消息
 * @param historyCount 历史消息数量
 * @param maxLength 最大消息长度限制，默认值为20
 * @returns Promise<ChatMessage[]>
 */
export async function prepareMessagesWithHistory(
  currentMessage: ChatMessage,
  historyCount: number = 6,
  maxLength: number = 20
): Promise<ChatMessage[]> {
  // 获取历史消息（不包括当前正在发送的消息）
  const recentMessages = await getRecentMessages(historyCount);
  
  // 创建消息数组：历史消息 + 当前消息
  const messages = [...recentMessages] as ChatMessage[];
  
  // 确保消息总数不超过maxLength
  if (messages.length > maxLength - 1) {
    // 保留最近的消息，删除旧消息
    messages.splice(0, messages.length - (maxLength - 1));
  }
  
  // 添加当前消息
  messages.push(currentMessage);
  
  console.log('准备发送的消息数组:', messages);
  return messages;
}

/**
 * 发送流式聊天请求
 * @param messages 消息数组或单条消息
 * @param callbacks 流式回调
 * @param options API选项
 * @param historyCount 历史消息数量，默认为6
 * @returns 用于中止请求的AbortController
 */
export async function sendStreamChatRequest(
  messages: ChatMessage[] | ChatMessage,
  callbacks: StreamCallbacks,
  options: Partial<ChatApiOptions> = {},
  historyCount: number = 6
): Promise<AbortController> {
  const mergedOptions = { ...defaultApiOptions, ...options };
  
  // 如果传入的是单条消息，则添加历史记录
  let messagesArray: ChatMessage[];
  if (!Array.isArray(messages)) {
    messagesArray = await prepareMessagesWithHistory(messages, historyCount);
  } else {
    messagesArray = messages;
  }
  
  const requestBody = buildChatRequestBody(messagesArray, mergedOptions);
  
  // 创建AbortController用于中止请求
  const abortController = new AbortController();

  try {
    // 通知开始
    callbacks.onStart?.();
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mergedOptions.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: abortController.signal // 添加中止信号
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    // 处理流式响应
    processStreamResponse(response.body, callbacks, abortController.signal);
  } catch (error: any) {
    // 检查是否是由于中止导致的错误
    if (error.name === 'AbortError') {
      console.log('请求已中止');
      callbacks.onComplete?.(''); // 中止时清空并完成
    } else {
      console.error('API请求错误:', error);
      callbacks.onError?.(error);
    }
  }
  
  return abortController; // 返回控制器供外部使用
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
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  // 如果提供了signal信号，监听中止事件
  if (signal) {
    signal.addEventListener('abort', () => {
      reader.cancel().catch(err => console.error('取消读取流出错:', err));
    });
  }

  try {
    while (true) {
      // 检查是否已中止
      if (signal?.aborted) {
        reader.cancel().catch(err => console.error('取消读取流出错:', err));
        break;
      }
      
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // 处理缓冲区中的所有完整行
      let lineEnd;
      while ((lineEnd = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);
        
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          // 检查是否是结束标记
          if (data === '[DONE]') {
            // 最终处理文本格式
            const formattedText = formatOutputText(fullText);
            callbacks.onComplete?.(formattedText);
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0]?.delta?.content) {
              const content = parsed.choices[0].delta.content;
              fullText += content;
              
              // 向UI回调发送当前token
              callbacks.onToken?.(content);
            }
          } catch (e) {
            console.error('解析响应数据出错:', e, data);
          }
        }
      }
    }

    // 处理最后的缓冲区（如果有剩余内容）
    decoder.decode();
    const formattedText = formatOutputText(fullText);
    callbacks.onComplete?.(formattedText);
  } catch (error: any) {
    // 处理中止错误
      console.error('处理流式响应时出错:', error);
   
  }
}

/**
 * 生成图像API
 * @param prompt 提示词
 * @param callbacks 回调函数
 * @param options 图像生成选项
 * @param messages 历史消息 (可选)
 * @returns 用于中止请求的AbortController
 */
export async function generateImage(
  prompt: string,
  callbacks: ImageCallbacks,
  options: Partial<ImageGenOptions> = {},
  messages?: any[]
): Promise<AbortController> {
  const mergedOptions = { ...defaultImageGenOptions, ...options, prompt };
  
  // 创建AbortController用于中止请求
  const abortController = new AbortController();

  try {
    // 通知开始
    callbacks.onStart?.();
    
    const response = await fetch('https://api.gpt.ge/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mergedOptions.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: mergedOptions.model,
        prompt: mergedOptions.prompt,
        messages: messages || [], // 传递历史消息
        size: mergedOptions.size,
        // quality: mergedOptions.quality,
        n: mergedOptions.n
      }),
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`图像生成请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].b64_json) {
      const imageBase64 = `data:image/png;base64,${data.data[0].b64_json}`;
      callbacks.onComplete?.(imageBase64);
    } else if (data.data && data.data[0] && data.data[0].url) {
      // 如果返回URL而不是base64，则使用URL
      callbacks.onComplete?.(data.data[0].url);
    } else {
      throw new Error('图像生成响应格式错误');
    }
  } catch (error: any) {
    // 检查是否是由于中止导致的错误
    if (error.name === 'AbortError') {
      console.log('图像生成请求已中止');
    } else {
      console.error('图像生成请求错误:', error);
      callbacks.onError?.(error);
    }
  }
  
  return abortController;
}

/**
 * 编辑图像API
 * @param imageFile 源图像文件
 * @param prompt 提示词
 * @param maskFile 遮罩图像文件（可选）
 * @param callbacks 回调函数
 * @param options 图像编辑选项
 * @returns 用于中止请求的AbortController
 */
export async function editImage(
  imageFile: File,
  prompt: string,
  maskFile: File | null,
  callbacks: ImageCallbacks,
  options: Partial<ImageEditOptions> = {}
): Promise<AbortController> {
  const mergedOptions = { ...defaultImageEditOptions, ...options, prompt };
  
  // 创建AbortController用于中止请求
  const abortController = new AbortController();

  try {
    // 通知开始
    callbacks.onStart?.();
    
    // 创建FormData
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('prompt', mergedOptions.prompt);
    formData.append('model', mergedOptions.model);
    formData.append('size', mergedOptions.size);
    formData.append('n', mergedOptions.n.toString());
    
    // 如果有遮罩图像则添加
    if (maskFile) {
      formData.append('mask', maskFile);
    }
    
    const response = await fetch('https://api.gpt.ge/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mergedOptions.apiKey}`
      },
      body: formData,
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`图像编辑请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].b64_json) {
      const imageBase64 = `data:image/png;base64,${data.data[0].b64_json}`;
      callbacks.onComplete?.(imageBase64);
    } else if (data.data && data.data[0] && data.data[0].url) {
      // 如果返回URL而不是base64，则使用URL
      callbacks.onComplete?.(data.data[0].url);
    } else {
      throw new Error('图像编辑响应格式错误');
    }
  } catch (error: any) {
    // 检查是否是由于中止导致的错误
    if (error.name === 'AbortError') {
      console.log('图像编辑请求已中止');
    } else {
      console.error('图像编辑请求错误:', error);
      callbacks.onError?.(error);
    }
  }
  
  return abortController;
}

/**
 * 将base64数据转换为File对象
 * @param base64Data base64数据（可以包含前缀）
 * @param fileName 文件名
 * @param mimeType MIME类型
 * @returns File对象
 */
export function base64ToFile(base64Data: string, fileName: string, mimeType: string = 'image/png'): File {
  // 如果包含前缀，则去除前缀
  const base64Content = base64Data.includes('base64,') 
    ? base64Data.split('base64,')[1] 
    : base64Data;
  
  // 将base64解码为二进制数据
  const byteCharacters = atob(base64Content);
  const byteArrays: Uint8Array[] = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  const blob = new Blob(byteArrays, { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}

/**
 * 格式化模型输出文本，保留换行和格式
 * @param text 原始模型输出文本
 * @returns 格式化后的HTML文本
 */
export function formatOutputText(text: string): string {
  if (!text) return '';
  
  // 记录处理前的文本用于调试
  console.log('格式化前的原始文本:', text);
  
  // 替换井号标记（如 "###"，"####"等）
  text = text.replace(/^(#{1,6})\s*(.+)$/gm, ( hashes, content) => {
    // 根据井号数量决定标题级别或者样式
    const level = Math.min(hashes.length, 6);
    // 对于标题内容，应用颜色样式而不是使用h标签
    return `<div class="markdown-heading level-${level}">${content}</div>`;
  });
  
  // 替换加粗文本
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 替换换行符为HTML换行标签
  text = text.replace(/\n/g, '<br>');
  
  // 去除连续的<br>标签
  text = text.replace(/<br><br><br>/g, '<br><br>');
  
  // 记录处理后的文本用于调试
  console.log('格式化后的HTML文本:', text);
  
  return text;
} 