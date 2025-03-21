import { defineStore } from 'pinia'
import { getProducts, getPayPage } from '@/api/order'
import { useToaster } from '@/components/modules/toats/index'
import { getOrdersStatus } from '@/api/order'

// import { useToaster } from '@/components/modules/toats/index'
interface typePayListParms {
  current: number
  page_size: number
  status?: string
}
export const useOrderStore = defineStore('userOrder', {
  state: () => ({
    showProduct: false,
    products: [] as any[],
    payList: {} as any,
    payListParms: {
      current: 1,
      page_size: 10
    } as typePayListParms,
    wechatExpireAt: '',
    wechatExpireAtStamp: 0,
    showWechat: false,
    iTimer: null as ReturnType<typeof setInterval> | null,
    timerStatus: null as ReturnType<typeof setInterval> | null
  }),
  actions: {
    async getProducts() {
      const res = await getProducts()
      this.products = res.data.products
      return res.data
    },
    async getPayPage() {
      const temp = { ...this.payListParms }
      if (temp.status == '' || temp.status == 'all') {
        delete temp.status
      }
      const res = await getPayPage(temp)
      this.payList = res.data
      return res.data
    },
    countExpire(expireAt: string) {
      // const expireAt = localStorage.getItem('expire_at');
      if (expireAt) {
        const now = new Date().getTime()
        const expire = new Date(expireAt).getTime()
        const diff = expire - now
        const minutes = Math.floor(diff / 1000 / 60)
        const seconds = Math.floor((diff / 1000) % 60)
        this.wechatExpireAt = `${minutes}分${seconds}秒`
        this.wechatExpireAtStamp = diff
        if (diff <= 0) {
          if (this.iTimer !== null) {
            clearInterval(this.iTimer)
          }
          localStorage.removeItem('expire_at')
          localStorage.removeItem('code_url')
          localStorage.removeItem('order_no')
          // this.showWechat = false;
        }
      }
    },
    intervalTimer(fn: Function) {
      this.iTimer = setInterval(() => {
        this.countExpire(localStorage.getItem('expire_at') as string)
      }, 1000)
      this.timerStatus = setInterval(async () => {
        if (!localStorage.getItem('order_no')) {
          if (this.timerStatus !== null) {
            clearInterval(this.timerStatus)
          }
          return
        }
        let res = await getOrdersStatus(localStorage.getItem('order_no') as string)
        if (res.data.status != 'not_pay') {
          if (this.timerStatus !== null) {
            clearInterval(this.timerStatus)
          }
          localStorage.removeItem('expire_at')
          localStorage.removeItem('code_url')
          localStorage.removeItem('order_no')
          if (this.iTimer !== null) {
            clearInterval(this.iTimer)
          }
          this.showWechat = false
          if (res.data.status == 'success') {
            useToaster.success('Payment Success')
            if (fn) {
              fn()
            }
          }
          if (res.data.status == 'failed') {
            useToaster.error('Order creation failed')
          }
        }
      }, 2000)
    }
  }
})
