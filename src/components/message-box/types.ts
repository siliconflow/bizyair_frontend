export enum NotificationType {
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  SYSTEM_PAYMENT = 'SYSTEM_PAYMENT',
  USER_LIKE = 'USER_LIKE',
  USER_FORK = 'USER_FORK'
}

export interface Notification {
  id: number
  broadcast: boolean
  title: string
  content: string
  expire_at: string
  read: boolean
  receiver_ids: string | string[]
  related_id: number
  related_type: string
  sender_id: string
  type: number
  [property: string]: any
}
