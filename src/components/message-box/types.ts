export enum NotificationType {
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  SYSTEM_PAYMENT = 'SYSTEM_PAYMENT',
  USER_LIKE = 'USER_LIKE',
  USER_FORK = 'USER_FORK'
}

export interface Notification {
  id: number
  type: NotificationType
  senderId: number
  receiverId: number
  broadcast: boolean
  title: string
  content: string
  validEndAt: string
  relatedType: string
  relatedId: number
  createdAt: string
  readAt: string | null
  imageUrl?: string
}
