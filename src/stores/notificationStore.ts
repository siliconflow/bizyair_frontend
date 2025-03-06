import { defineStore } from 'pinia'
import { Notification, NotificationType } from '@/components/message-box/types'
import {
  get_messages_list,
  read_all_message,
  read_message,
  get_message_unread_count
} from '@/api/message-box'
import { useDictStore } from './dictStore'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    officialNotices: [] as Notification[],
    userLikeNotices: [] as Notification[],
    userForkNotices: [] as Notification[],

    officialNoticesUnReadCount: 0,
    userLikeNoticesUnReadCount: 0,
    userForkNoticesUnReadCount: 0,
    totalUnreadCount: 0,
    officialNoticesLoading: false,
    userLikeNoticesLoading: false,
    userForkNoticesLoading: false,

    officialNoticesInitialized: false,
    userLikeNoticesInitialized: false,
    userForkNoticesInitialized: false,

    officialNoticesFilter: {
      page_size: 10,
      last_pm_id: 0,
      last_broadcast_id: 0,
      types: [] as number[] | string[] | string,
      read_status: undefined as undefined | string | null
    },

    userLikeNoticesFilter: {
      page_size: 10,
      last_pm_id: 0,
      last_broadcast_id: 0,
      types: [] as number[] | string[] | string
    },

    userForkNoticesFilter: {
      page_size: 10,
      last_pm_id: 0,
      last_broadcast_id: 0,
      types: [] as number[] | string[] | string
    }
  }),

  getters: {
    officialNotificationTypes() {
      const dictStore = useDictStore()
      return dictStore.getDict('official_notification_types')
    },

    notificationTypes() {
      const dictStore = useDictStore()
      return dictStore.getDict('notification_types')
    },

    getNotificationsByType: state => (type: NotificationType) => {
      switch (type) {
        case NotificationType.SYSTEM_ANNOUNCEMENT:
          return state.officialNotices
        case NotificationType.USER_LIKE:
          return state.userLikeNotices
        case NotificationType.USER_FORK:
          return state.userForkNotices
        default:
          return []
      }
    },

    getLoadingStatusByType: state => (type: NotificationType) => {
      switch (type) {
        case NotificationType.SYSTEM_ANNOUNCEMENT:
          return state.officialNoticesLoading
        case NotificationType.USER_LIKE:
          return state.userLikeNoticesLoading
        case NotificationType.USER_FORK:
          return state.userForkNoticesLoading
        default:
          return false
      }
    },

    getInitializedStatusByType: state => (type: NotificationType) => {
      switch (type) {
        case NotificationType.SYSTEM_ANNOUNCEMENT:
          return state.officialNoticesInitialized
        case NotificationType.USER_LIKE:
          return state.userLikeNoticesInitialized
        case NotificationType.USER_FORK:
          return state.userForkNoticesInitialized
        default:
          return false
      }
    }
  },

  actions: {
    buildQueryParams(filter: any) {
      const params: Record<string, any> = {
        page_size: filter.page_size
      }

      if (filter.last_pm_id) {
        params.last_pm_id = filter.last_pm_id
      }

      if (filter.last_broadcast_id) {
        params.last_broadcast_id = filter.last_broadcast_id
      }

      if (filter.read_status !== undefined && filter.read_status !== null) {
        params.read_status = filter.read_status === 'read' ? 'true' : 'false'
      }

      if (filter.types && filter.types.length > 0) {
        if (filter.types.length === 1) {
          params.types = filter.types[0]
        } else {
          params.types = filter.types.join(',')
        }
      }
      return params
    },

    initFilters() {
      this.officialNoticesFilter.types = this.officialNotificationTypes.map(type =>
        Number(type.value)
      )

      const likeType = this.notificationTypes.find(
        item => item.label === NotificationType.USER_LIKE
      )
      if (likeType?.value !== undefined) {
        this.userLikeNoticesFilter.types = [Number(likeType.value)]
      } else {
        this.userLikeNoticesFilter.types = [101]
      }

      const forkType = this.notificationTypes.find(
        item => item.label === NotificationType.USER_FORK
      )
      if (forkType?.value !== undefined) {
        this.userForkNoticesFilter.types = [Number(forkType.value)]
      } else {
        this.userForkNoticesFilter.types = [102]
      }
    },

    async loadOfficialNotices(reset = false) {
      if (this.officialNoticesLoading) return

      try {
        this.officialNoticesLoading = true

        if (reset) {
          this.officialNotices = []
          this.officialNoticesFilter.last_pm_id = 0
          this.officialNoticesFilter.last_broadcast_id = 0
        }

        const params = this.buildQueryParams({
          ...this.officialNoticesFilter,
          read_status: this.officialNoticesFilter.read_status
        })

        const res = await get_messages_list(params)

        if (res.data) {
          if (res.data.last_pm_id) {
            this.officialNoticesFilter.last_pm_id = res.data.last_pm_id
          }

          if (res.data.last_broadcast_id) {
            this.officialNoticesFilter.last_broadcast_id = res.data.last_broadcast_id
          }

          if (res.data.notifications && res.data.notifications.length > 0) {
            this.officialNotices = [...this.officialNotices, ...res.data.notifications]
          }
        }

        this.officialNoticesInitialized = true
      } catch (error) {
        console.error('加载官方通知失败', error)
      } finally {
        this.officialNoticesLoading = false
      }
    },

    async loadUserLikeNotices(reset = false) {
      if (this.userLikeNoticesLoading) return

      try {
        this.userLikeNoticesLoading = true

        if (reset) {
          this.userLikeNotices = []
          this.userLikeNoticesFilter.last_pm_id = 0
          this.userLikeNoticesFilter.last_broadcast_id = 0
        }

        const params = this.buildQueryParams(this.userLikeNoticesFilter)

        const res = await get_messages_list(params)

        if (res.data) {
          if (res.data.last_pm_id) {
            this.userLikeNoticesFilter.last_pm_id = res.data.last_pm_id
          }

          if (res.data.last_broadcast_id) {
            this.userLikeNoticesFilter.last_broadcast_id = res.data.last_broadcast_id
          }

          if (res.data.notifications && res.data.notifications.length > 0) {
            this.userLikeNotices = [...this.userLikeNotices, ...res.data.notifications]
          }
        }

        this.userLikeNoticesInitialized = true
      } catch (error) {
        console.error('加载用户点赞通知失败', error)
      } finally {
        this.userLikeNoticesLoading = false
      }
    },

    async loadUserForkNotices(reset = false) {
      if (this.userForkNoticesLoading) return

      try {
        this.userForkNoticesLoading = true

        if (reset) {
          this.userForkNotices = []
          this.userForkNoticesFilter.last_pm_id = 0
          this.userForkNoticesFilter.last_broadcast_id = 0
        }

        const params = this.buildQueryParams(this.userForkNoticesFilter)

        const res = await get_messages_list(params)

        if (res.data) {
          if (res.data.last_pm_id) {
            this.userForkNoticesFilter.last_pm_id = res.data.last_pm_id
          }

          if (res.data.last_broadcast_id) {
            this.userForkNoticesFilter.last_broadcast_id = res.data.last_broadcast_id
          }

          if (res.data.notifications && res.data.notifications.length > 0) {
            this.userForkNotices = [...this.userForkNotices, ...res.data.notifications]
          }
        }

        this.userForkNoticesInitialized = true
      } catch (error) {
        console.error('加载用户复刻通知失败', error)
      } finally {
        this.userForkNoticesLoading = false
      }
    },

    async loadNotificationsByType(type: NotificationType, reset: boolean = false) {
      switch (type) {
        case NotificationType.SYSTEM_ANNOUNCEMENT:
          await this.loadOfficialNotices(reset)
          break
        case NotificationType.USER_LIKE:
          await this.loadUserLikeNotices(reset)
          await read_all_message(101)
          this.userLikeNotices.forEach(notice => {
            notice.read = true
          })
          this.userLikeNoticesUnReadCount = 0
          break
        case NotificationType.USER_FORK:
          await this.loadUserForkNotices(reset)
          await read_all_message(102)
          this.userForkNotices.forEach(notice => {
            notice.read = true
          })
          this.userForkNoticesUnReadCount = 0
          break
      }
      await this.loadUnreadCount()
    },

    setOfficialNoticesFilter(filter: { read_status?: string | null; type?: number }) {
      if (filter.read_status !== undefined) {
        this.officialNoticesFilter.read_status = filter.read_status
      }

      if (filter.type !== undefined) {
        this.officialNoticesFilter.types = [filter.type]
      } else {
        this.officialNoticesFilter.types = this.officialNotificationTypes.map(type =>
          Number(type.value)
        )
      }

      this.officialNoticesFilter.last_pm_id = 0
      this.officialNoticesFilter.last_broadcast_id = 0
    },

    async markAsRead(type: NotificationType, id: number) {
      try {
        await read_message(id)

        if (type === NotificationType.SYSTEM_ANNOUNCEMENT) {
          this.officialNotices = this.officialNotices.map(notice => {
            if (notice.id === id) {
              return { ...notice, read: true }
            }
            return notice
          })
        } else if (type === NotificationType.USER_LIKE) {
          this.userLikeNotices = this.userLikeNotices.map(notice => {
            if (notice.id === id) {
              return { ...notice, read: true }
            }
            return notice
          })
        } else if (type === NotificationType.USER_FORK) {
          this.userForkNotices = this.userForkNotices.map(notice => {
            if (notice.id === id) {
              return { ...notice, read: true }
            }
            return notice
          })
        }

        await this.loadUnreadCount()
      } catch (error) {
        console.error('标记已读失败', error)
      }
    },

    async markAllAsRead() {
      try {
        await read_all_message()

        this.officialNotices = this.officialNotices.map(notice => ({
          ...notice,
          read: true
        }))

        this.userLikeNotices = this.userLikeNotices.map(notice => ({
          ...notice,
          read: true
        }))

        this.userForkNotices = this.userForkNotices.map(notice => ({
          ...notice,
          read: true
        }))

        this.officialNoticesUnReadCount = 0
        this.userLikeNoticesUnReadCount = 0
        this.userForkNoticesUnReadCount = 0

        await this.loadUnreadCount()
      } catch (error) {
        console.error('标记全部已读失败', error)
      }
    },

    async loadUnreadCount() {
      try {
        const res = await get_message_unread_count()
        if (res?.data && res?.data.types && res?.data.counts) {
          this.officialNoticesUnReadCount = 0
          this.userLikeNoticesUnReadCount = 0
          this.userForkNoticesUnReadCount = 0

          const officialTypes = this.officialNotificationTypes.map(type => Number(type.value))

          const likeType = this.notificationTypes.find(
            item => item.label === NotificationType.USER_LIKE
          )
          const likeTypeValue = likeType ? Number(likeType.value) : 101

          const forkType = this.notificationTypes.find(
            item => item.label === NotificationType.USER_FORK
          )
          const forkTypeValue = forkType ? Number(forkType.value) : 102

          for (let i = 0; i < res.data.types.length; i++) {
            const type = res.data.types[i]
            const count = res.data.counts[i]

            if (officialTypes.includes(type)) {
              this.officialNoticesUnReadCount += count
            } else if (type === likeTypeValue) {
              this.userLikeNoticesUnReadCount = count
            } else if (type === forkTypeValue) {
              this.userForkNoticesUnReadCount = count
            }
          }
          this.totalUnreadCount =
            this.officialNoticesUnReadCount +
            this.userLikeNoticesUnReadCount +
            this.userForkNoticesUnReadCount
        }
      } catch (error) {
        console.error('Failed to get unread message count', error)
      }
    },

    async initialize() {
      await this.loadUnreadCount()
      this.initFilters()
    }
  }
})
