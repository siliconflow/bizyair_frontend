<template>
  <n-modal
    :show="show"
    class="w-[80vw] max-w-[1200px]"
    preset="card"
    :style="{ width: '80vw', maxWidth: '1200px', backgroundColor: '#353535' }"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
    @negative-click="onNegativeClick"
  >
    <div class="flex h-[80vh]">
      <div style="border-right: 1px solid rgba(110, 110, 110, 0.6)">
        <h1 class="text-2xl font-bold mb-6 pr-4 -mt-2">{{ $t('messageBox.title') }}</h1>
        <div class="w-[200px] pr-4">
          <div class="space-y-4">
            <div
              v-for="menu in menus"
              :key="menu.type"
              class="cursor-pointer rounded-sm p-[10px] flex items-center justify-between transition-colors duration-200"
              :class="
                activeType === menu.type
                  ? 'bg-primary text-white'
                  : ' bg-[#222222cc] hover:bg-[#4d4d4dee]'
              "
              @click="handleMenuClick(menu.type)"
            >
              <span>{{ menu.label }}</span>
              <n-badge
                v-if="getUnreadCount(menu.type) > 0"
                :value="getUnreadCount(menu.type) > 99 ? '99+' : getUnreadCount(menu.type)"
                :max="99"
              />
            </div>

            <div
              class="cursor-pointer rounded-sm p-[10px] flex items-center justify-center gap-2 transition-colors duration-200 mt-auto bg-[#222222cc] hover:bg-[#4d4d4dee]"
              style="margin-top: auto; position: absolute; bottom: 20px; width: calc(200px - 1rem)"
              @click="handleMarkAllRead"
            >
              <span>{{ $t('messageBox.markAllAsRead') }}</span>
              <span class="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                >
                  <path
                    d="M7.14169 10.7737C7.25258 10.8866 7.40791 10.9445 7.56567 10.9316C7.72343 10.9188 7.86732 10.8364 7.95841 10.7069L7.14169 10.7737ZM7.14169 10.7737L5.4528 9.05352L7.14169 10.7737ZM10.9272 5.61923L7.54951 10.4192L7.54946 10.4192C7.5437 10.4274 7.53476 10.4324 7.52524 10.4332L7.52491 10.4332C7.515 10.434 7.50534 10.4304 7.49849 10.4234L7.49847 10.4234L5.80958 8.70323L5.80957 8.70322C5.79668 8.69009 5.79687 8.66899 5.81 8.65611L5.81002 8.65609C5.82313 8.64321 5.84423 8.64338 5.85715 8.65653C5.85715 8.65653 5.85716 8.65653 5.85716 8.65654L7.09764 9.91997L7.51801 10.3481L7.86332 9.85742L10.8728 5.58085L10.9272 5.61923ZM10.9272 5.61923C10.9272 5.61922 10.9273 5.61922 10.9273 5.61921M10.9272 5.61923L10.9273 5.61921M10.9273 5.61921C10.9379 5.6041 10.9342 5.58334 10.9193 5.57278L10.9273 5.61921ZM1.93555 7.9999C1.93555 4.37451 4.87451 1.43555 8.4999 1.43555C12.1253 1.43555 15.0642 4.37451 15.0642 7.9999C15.0642 11.6252 12.1253 14.5642 8.4999 14.5642C4.87451 14.5642 1.93555 11.6252 1.93555 7.9999ZM8.4999 1.44887C4.88187 1.44887 1.94889 4.38187 1.94889 7.9999C1.94889 11.6179 4.88187 14.5509 8.4999 14.5509C12.1179 14.5509 15.0509 11.6179 15.0509 7.9999C15.0509 4.38188 12.1179 1.44887 8.4999 1.44887Z"
                    fill="#030712"
                    stroke="#F9FAFB"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 pl-4 border-l">
        <div
          class="flex justify-end items-center gap-4 min-h-[32px]"
          :class="activeType === NotificationType.SYSTEM_ANNOUNCEMENT ? 'mb-2' : 'mb-4'"
        >
          <v-select
            v-if="activeType === NotificationType.SYSTEM_ANNOUNCEMENT"
            v-model:model-value="selectedNotificationType"
            :placeholder="$t('messageBox.notificationType')"
            class="w-[200px]"
          >
            <SelectItem
              value="all"
              class="cursor-pointer hover:bg-[#4d4d4dee] transition-colors duration-200"
              :class="selectedNotificationType === 'all' ? 'bg-[#7C3AED] text-white' : ''"
              >{{ $t('messageBox.allNotifications') }}</SelectItem
            >
            <SelectItem
              v-for="type in officialNotificationTypes"
              :key="type.value"
              :value="type.value"
              class="cursor-pointer hover:bg-[#4d4d4dee] transition-colors duration-200"
              :class="selectedNotificationType === type.value ? 'bg-[#7C3AED] text-white' : ''"
              >{{ $t(`messageBox.notificationTypes.${type.label}`) }}</SelectItem
            >
          </v-select>

          <v-select
            v-if="activeType === NotificationType.SYSTEM_ANNOUNCEMENT"
            v-model:model-value="readStatus"
            placeholder="Select Notice Type"
            class="w-[200px]"
          >
            <SelectItem
              v-for="(e, i) in filterOptions"
              :key="i"
              :value="e.value"
              class="cursor-pointer hover:bg-[#4d4d4dee] transition-colors duration-200"
              :class="readStatus === e.value ? 'bg-[#7C3AED] text-white' : ''"
              >{{ $t(`messageBox.${e.value}`) }}</SelectItem
            >
          </v-select>
        </div>

        <MessageList
          :type="activeType"
          :filter="readStatus"
          :selected-type="
            selectedNotificationType && selectedNotificationType !== 'all'
              ? Number(selectedNotificationType)
              : undefined
          "
        />
      </div>
    </div>
  </n-modal>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { NModal, NBadge } from 'naive-ui'
  import MessageList from './modules/MessageList.vue'
  import { NotificationType } from './types'
  import vSelect from '@/components/modules/vSelect.vue'
  import { SelectItem } from '@/components/ui/select'
  import { useNotificationStore } from '@/stores/notificationStore'
  import { useDictStore } from '@/stores/dictStore'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const dictStore = useDictStore()
  const notificationStore = useNotificationStore()

  const officialNotificationTypes = computed(() => {
    return dictStore.getDict('official_notification_types')
  })

  const readStatus = computed({
    get: () => {
      return notificationStore.officialNoticesFilter.read_status || 'all'
    },
    set: value => {
      notificationStore.setOfficialNoticesFilter({
        read_status: value === 'all' ? null : value,
        type:
          selectedNotificationType.value && selectedNotificationType.value !== 'all'
            ? Number(selectedNotificationType.value)
            : undefined
      })
      notificationStore.loadOfficialNotices(true)
    }
  })

  const selectedNotificationType = computed({
    get: () => {
      if (notificationStore.officialNoticesFilter.types.length === 1) {
        return String(notificationStore.officialNoticesFilter.types[0])
      }
      return 'all'
    },
    set: value => {
      notificationStore.setOfficialNoticesFilter({
        read_status: readStatus.value !== 'all' ? readStatus.value : undefined,
        type: value && value !== 'all' ? Number(value) : undefined
      })
      notificationStore.loadOfficialNotices(true)
    }
  })

  const { show } = defineProps<{
    show: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:show', value: boolean): void
  }>()

  const onNegativeClick = () => {
    emit('update:show', false)
  }

  const menus = computed(() => [
    {
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      label: t('messageBox.officialNotices'),
      unreadCount: notificationStore.officialNoticesUnReadCount
    },
    {
      type: NotificationType.USER_FORK,
      label: t('messageBox.userForks'),
      unreadCount: notificationStore.userForkNoticesUnReadCount
    },
    {
      type: NotificationType.USER_LIKE,
      label: t('messageBox.receivedLikes'),
      unreadCount: notificationStore.userLikeNoticesUnReadCount
    }
  ])

  const activeType = ref<NotificationType>(NotificationType.SYSTEM_ANNOUNCEMENT)

  const filterOptions = [
    { label: t('messageBox.all'), value: 'all' },
    { label: t('messageBox.unread'), value: 'unread' },
    { label: t('messageBox.read'), value: 'read' }
  ]

  const getUnreadCount = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return notificationStore.officialNoticesUnReadCount
      case NotificationType.USER_LIKE:
        return notificationStore.userLikeNoticesUnReadCount
      case NotificationType.USER_FORK:
        return notificationStore.userForkNoticesUnReadCount
      default:
        return 0
    }
  }

  const handleMenuClick = (type: NotificationType) => {
    activeType.value = type

    if (type === NotificationType.SYSTEM_ANNOUNCEMENT) {
      if (notificationStore.officialNoticesFilter.types.length === 0) {
        notificationStore.setOfficialNoticesFilter({
          read_status: undefined,
          type: undefined
        })
      }
    } else if (type === NotificationType.USER_LIKE) {
      const likeType = notificationStore.notificationTypes.find(
        item => item.label === NotificationType.USER_LIKE
      )
      if (likeType?.value !== undefined) {
        notificationStore.userLikeNoticesFilter.types = [101]
      }
    } else if (type === NotificationType.USER_FORK) {
      const forkType = notificationStore.notificationTypes.find(
        item => item.label === NotificationType.USER_FORK
      )

      if (forkType?.value !== undefined) {
        notificationStore.userForkNoticesFilter.types = [102]
      }
    }

    notificationStore.loadNotificationsByType(
      type,
      !notificationStore.getInitializedStatusByType(type)
    )
  }

  const handleMarkAllRead = async () => {
    await notificationStore.markAllAsRead()
  }

  watch(
    () => show,
    async (newVal, oldVal) => {
      if (newVal && !oldVal) {
        await refreshData()
      }
    }
  )

  const refreshData = async () => {
    await dictStore.fetchDictData()
    notificationStore.loadNotificationsByType(activeType.value, true)
  }

  onMounted(async () => {
    await dictStore.fetchDictData()
    await notificationStore.initialize()
  })
</script>

<style scoped lang="less">
  :deep(.n-base-select-menu .n-base-select-option.n-base-select-option--selected) {
    color: #fff;
  }
</style>
