export interface Notification {
  id: number,
  sender_id: string,
  receiver_id: string,
  type: number,
  read: boolean,
  title: string,
  content: string,
  related_type: string,
  related_ids: number[],
  sender_user_name: string,
  receiver_user_name: string,
  created_at: string
}

