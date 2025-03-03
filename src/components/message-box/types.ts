export enum NotificationType {
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  SYSTEM_PAYMENT = 'SYSTEM_PAYMENT',
  USER_LIKE = 'USER_LIKE',
  USER_FORK = 'USER_FORK'
}

export interface Notification {
  id: number
  /**
   * 是否全体消息
   */
  broadcast: boolean

  title: string

  content: string
  /**
   * RFC3339过期时间，仅限全体消息使用且必填
   */
  expire_at: string

  read: boolean
  /**
   * userid
   */
  receiver_ids: string | string[]
  /**
   * 关联资源id，比如bmv.id
   */
  related_id: number
  /**
   * 关联类型，比如bizy_model_version
   */
  related_type: string
  /**
   * userid
   */
  sender_id: string

  /**
   * 消息类型id，从dict接口拿
   */
  type: number
  [property: string]: any
}
