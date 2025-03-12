import { defineStore } from 'pinia'
import { get_user_info, get_smetadata, get_coins, get_wallet } from '@/api/user'
// , put_smetadata, post_real_name, get_wallet, get_coins
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
interface typeUsersMetadata {
  id: number
  name: string
  shareId?: string | number
  status: "normal" | "disable"
  last_share_id_update_at?: string
  avatar?: string
  Introducation: string
  auth: 0 | 1 | 2
  auth_type:  0 | 1
  introduction?: string
}
interface typeUserWallte {
  charge_balance: string
  gift_balance: string
  total_balance: string
  charge_today_expired: boolean
  gift_today_expired: boolean
}
interface typeList {
  id: number
  coin_type: 1 | 2
  amount: number
  expired_at: number
}
interface typeUserCoinsData {
  total: number
  current: number
  page_size: number
  total_charge_coins: number
  total_gift_coins: number
  list: typeList[]
}
export const useStatusStore = defineStore('userStatus', {
  state: () => ({
    infoData: {} as UserInfo,
    isLogin: false,
    socketMessage: {},
    showApiKeyDialog: false,
    showInfoDialog: false,
    showUploadInfoDialog: false,
    showUploadAvatarDialog: false,
    showPropertyDialog: false,
    userAvatar: 'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/img/20250311/ViKdyI5vrD7XGNCXHuVTW4sPUXNusj3W.webp',
    usersMetadata: {} as typeUsersMetadata,
    userWallte: {} as typeUserWallte,
    userCoinsData: {} as typeUserCoinsData,
    coinsParam: {
      current: 1,
      page_size: 20,
      coin_type: 1,
      expire_days: 30,
    }
    // showInfoDialog: false,
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
    sendSocket(fn: (res: any) => void) {
      const wsClient = new WebSocketClient(
        `/bizyair/ws?clientId=${sessionStorage.getItem('clientId')}`,
        []
      )
      wsClient.onMessage = message => {
        const res = JSON.parse(message.data)
        this.socketMessage = res
        if (res && res.type === 'errors') {
          console.error(res.data.message)
          return
        }
        if (fn) {
          fn(res)
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
    },
    async get_smetadata() {
      let res = await get_smetadata()
      this.usersMetadata = res.data
      return res.data
    },
    async get_wallet() {
      let res = await get_wallet()
      this.userWallte = res.data
      return res.data
    },
    async handlePropertyDialog(bool: boolean) {
      this.showPropertyDialog = bool
      if (bool) {
        const res = await get_coins({ ...this.coinsParam })
        this.userCoinsData = res.data
      }
    }
  }
})
