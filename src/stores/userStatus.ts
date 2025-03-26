import { defineStore } from 'pinia'
import { get_user_info, get_metadata, get_coins, get_wallet, logout } from '@/api/user'
// , put_smetadata, post_real_name, get_wallet, get_coins
import { WebSocketClient } from '@/utils/socket.ts'
// import useClipboard from 'vue-clipboard3'
import { useToaster } from '@/components/modules/toats/index'
// const { toClipboard } = useClipboard()
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
  status: 'normal' | 'disable'
  last_share_id_update_at?: string
  avatar?: string
  Introducation: string
  auth: 0 | 1 | 2
  auth_type: 0 | 1
  introduction?: string
}
interface typeUserWallte {
  charge_balance: string
  gift_balance: string
  total_balance: string
  charge_today_expired: boolean
  gift_today_expired: boolean
  total_balance_amount: string
  charge_balance_amount: string
  gift_balance_amount: string
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
interface typeCoinsParam {
  current: number
  page_size: number
  coin_type?: number
  expire_days: number
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
    showConsumptionBillDialog: false,
    showPropertyDialog: false,
    showRecordDialog: false,
    userAvatar:
      'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/ViKdyI5vrD7XGNCXHuVTW4sPUXNusj3W.webp',
    usersMetadata: {} as typeUsersMetadata,
    userWallte: {} as typeUserWallte,
    userCoinsData: {} as typeUserCoinsData,
    coinsParam: {
      current: 1,
      page_size: 20,

      expire_days: 365
    } as typeCoinsParam,
    recordParam: {
      current: 1,
      page_size: 20,
      order: 'desc'
    },
    recordOptions: [],
    coinsListTitle: ''
  }),
  actions: {
    loginRefresh(isLoading?: string) {
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
      if (!isLoading || isLoading != 'loading') {
        this.get_metadata()
        this.get_wallet()
      }
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
    async copyText(text: string) {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text)
          useToaster.success('Copy success')
        } else {
          const input = document.createElement('input')
          input.value = text
          document.body.appendChild(input)
          input.select()
          document.execCommand('copy')
          document.body.removeChild(input)
        }
      } catch (err) {
        useToaster.error('Copy failed')
      }
    },
    handleShowInfoDialog(bool: boolean) {
      this.showInfoDialog = bool
      if (bool) {
        this.get_metadata()
        this.get_wallet()
      }
    },
    async get_metadata() {
      let res = await get_metadata()
      this.usersMetadata = res.data
      return res.data
    },
    async get_wallet() {
      let res = await get_wallet()
      this.userWallte = res.data
      return res.data
    },
    async get_coins() {
      const temp = { ...this.coinsParam }
      if (!temp.coin_type) {
        delete temp.coin_type
      }
      const res = await get_coins(temp)
      this.userCoinsData = res.data
      return res.data
    },
    async handlePropertyDialog(bool: boolean) {
      this.showPropertyDialog = bool
      if (bool) {
        this.get_coins()
      }
    },
    async handleRecordDialog(bool: boolean) {
      this.showRecordDialog = bool
      if (bool) {
        this.get_coins()
      }
    },
    async logout() {
      await logout()
      this.isLogin = false
      useToaster.success('Logout success')
    }
  }
})
