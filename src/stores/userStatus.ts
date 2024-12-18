import { defineStore } from 'pinia'
import { get_user_info } from '@/api/user'
import { WebSocketClient } from '@/utils/socket.ts'
import useClipboard from 'vue-clipboard3'
import { useToaster } from '@/components/modules/toats/index'
const { toClipboard } = useClipboard()
interface UserInfo {
  level: number
  name: string
  api_key: string
  share_id: string
  last_share_id_update_at: string
  [key: string]: any
}
export const useStatusStore = defineStore('userStatus', {
  state: () => ({
    infoData: {} as UserInfo,
    isLogin: false,
    socketMessage: {},
    showApiKeyDialog: false
  }),
  actions: {
    loginRefresh() {
      get_user_info()
        .then((info: { data: any }) => {
          if (info !== null) {
            sessionStorage.setItem('userInfo', JSON.stringify(info.data))
            this.infoData = info.data
            this.isLogin = true
          }
        })
        .catch(() => {
          this.isLogin = false
        })
    },
    sendSocket() {
      const wsClient = new WebSocketClient(
        `/bizyair/ws?clientId=${sessionStorage.getItem('clientId')}`,
        []
      )
      wsClient.onMessage = message => {
        const res = JSON.parse(message.data)
        this.socketMessage = res
        if (res && res.type === 'errors') {
          console.error(res.data.message)
        }
      }
    },
    handleApiKeyDialog(val: boolean) {
      this.showApiKeyDialog = val
    },
    copyText(text: string) {
      toClipboard(text)
        .then(() => {
          useToaster.success('Copy success')
        })
        .catch(() => {
          useToaster.error('Copy failed')
        })
    }
  }
})
