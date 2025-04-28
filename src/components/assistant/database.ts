// 数据库操作相关函数

import { ChatContent } from './util';

// 数据库信息
const DB_NAME = 'bizyair_assistant';
const DB_VERSION = 1;
const CHAT_STORE_NAME = 'chat_history';

// 消息类型
export type MessageType = 'text' | 'image' | 'image_edit';

// 存储的消息类型
export interface StoredChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | ChatContent[];
  timestamp: number;
  messageType?: MessageType; // 消息类型，用于区分普通消息、生成图像和编辑图像
  originalImage?: string; // 编辑图像时的原始图像
  prompt?: string; // 图像生成或编辑的提示词
}

/**
 * 初始化IndexedDB数据库
 * @returns Promise<IDBDatabase>
 */
export function initDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('数据库打开失败:', event);
      reject('数据库打开失败');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // 如果对象仓库不存在，则创建
      if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
        const store = db.createObjectStore(CHAT_STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('messageType', 'messageType', { unique: false });
        console.log('创建聊天历史存储成功');
      }
    };
  });
}

/**
 * 生成唯一ID
 * @returns string
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 保存消息到数据库
 * @param message 消息对象
 * @returns Promise<string> 消息ID
 */
export async function saveMessage(message: StoredChatMessage): Promise<string> {
  try {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CHAT_STORE_NAME);
      
      const request = store.add(message);
      
      request.onsuccess = () => {
        console.log('消息保存成功:', message);
        resolve(message.id);
      };
      
      request.onerror = (event) => {
        console.error('消息保存失败:', event);
        reject('消息保存失败');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('保存消息时出错:', error);
    throw error;
  }
}

/**
 * 从数据库获取最近的n条消息
 * @param count 获取的消息数量
 * @returns Promise<StoredChatMessage[]>
 */
export async function getRecentMessages(count: number = 10): Promise<StoredChatMessage[]> {
  try {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readonly');
      const store = transaction.objectStore(CHAT_STORE_NAME);
      const index = store.index('timestamp');
      
      // 使用倒序游标获取最新的记录
      const request = index.openCursor(null, 'prev');
      const messages: StoredChatMessage[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && messages.length < count) {
          messages.push(cursor.value);
          cursor.continue();
        } else {
          // 返回正确的时间顺序
          resolve(messages.reverse());
        }
      };
      
      request.onerror = (event) => {
        console.error('获取消息失败:', event);
        reject('获取消息失败');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('获取消息时出错:', error);
    return [];
  }
}

/**
 * 根据消息类型从数据库获取消息
 * @param messageType 消息类型
 * @param count 获取的消息数量
 * @returns Promise<StoredChatMessage[]>
 */
export async function getMessagesByType(messageType: MessageType, count: number = 10): Promise<StoredChatMessage[]> {
  try {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readonly');
      const store = transaction.objectStore(CHAT_STORE_NAME);
      const index = store.index('messageType');
      
      // 使用倒序游标获取最新的指定类型的记录
      const request = index.openCursor(IDBKeyRange.only(messageType), 'prev');
      const messages: StoredChatMessage[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && messages.length < count) {
          messages.push(cursor.value);
          cursor.continue();
        } else {
          // 返回正确的时间顺序
          resolve(messages.reverse());
        }
      };
      
      request.onerror = (event) => {
        console.error('获取消息失败:', event);
        reject('获取消息失败');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('根据类型获取消息时出错:', error);
    return [];
  }
}

/**
 * 清空数据库中的所有消息
 * @returns Promise<boolean>
 */
export async function clearAllMessages(): Promise<boolean> {
  try {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CHAT_STORE_NAME);
      
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('所有消息已清空');
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('清空消息失败:', event);
        reject(false);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('清空消息时出错:', error);
    return false;
  }
}

/**
 * 将前端消息转换为存储格式
 * @param message 前端显示的消息
 * @returns StoredChatMessage
 */
export function convertToStoredMessage(message: { 
  role: 'user' | 'assistant', 
  content: string, 
  hasImage?: boolean, 
  image?: string,
  messageType?: MessageType,
  originalImage?: string,
  prompt?: string
}): StoredChatMessage {
  let storedContent: string | ChatContent[];
  
  if (message.hasImage && message.image) {
    // 如果是带图片的消息
    storedContent = [
      {
        type: 'image_url',
        image_url: {
          url: message.image
        }
      },
      {
        type: 'text',
        text: message.content || ''
      }
    ];
  } else {
    // 纯文本消息
    storedContent = message.content;
  }
  
  return {
    id: generateId(),
    role: message.role,
    content: storedContent,
    timestamp: Date.now(),
    messageType: message.messageType || 'text',
    originalImage: message.originalImage,
    prompt: message.prompt
  };
} 