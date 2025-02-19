<template>
  <div class="h-[calc(80vh-100px)]">
    <n-virtual-list :items="messages" :item-size="120" :min-size="10" @scroll="handleScroll">
      <template #default="{ item }">
        <n-card class="mb-4" :class="!item.readAt && 'bg-gray-50'">
          <div class="flex">
            <!-- 左侧图片区域 -->
            <div class="w-[10%]" v-if="item.relatedType === 'IMAGE'">
              <img :src="item.imageUrl" class="w-16 h-16 object-cover rounded" alt="" />
            </div>

            <!-- 中间内容区域 -->
            <div :class="['flex-1 px-4', item.relatedType === 'IMAGE' ? 'w-[80%]' : 'w-[90%]']">
              <div class="flex justify-between items-start">
                <h4 class="font-medium text-base">{{ item.title }}</h4>
                <span class="text-gray-400 text-sm">
                  {{ formatDate(item.createdAt) }}
                </span>
              </div>
              <div class="mt-2 text-gray-600 line-clamp-2">
                {{ item.content }}
              </div>
            </div>

            <!-- 右侧未读标记 -->
            <div class="w-[10%] flex justify-end">
              <div v-if="!item.readAt" class="w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>
        </n-card>
      </template>
    </n-virtual-list>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue'
  import { NVirtualList, NCard } from 'naive-ui'
  import { NotificationType } from '../types'
  import { formatDate } from '../utils'

  const props = defineProps<{
    type: NotificationType
    filter: string
  }>()

  const emit = defineEmits<{
    (e: 'mark-read', id: number): void
  }>()

  const messages = ref<any[]>([])
  const page = ref(1)
  const loading = ref(false)

  const loadMessages = async () => {
    if (loading.value) return
    loading.value = true
    try {
      // TODO: 实现API调用
      const response = await fetch(
        `/api/notifications?type=${props.type}&filter=${props.filter}&page=${page.value}`
      )
      const data = await response.json()
      messages.value = [...messages.value, ...data.items]
    } finally {
      loading.value = false
    }
  }

  const handleScroll = ({
    scrollTop,
    scrollHeight,
    clientHeight
  }: {
    scrollTop: number
    scrollHeight: number
    clientHeight: number
  }) => {
    if (scrollHeight - scrollTop - clientHeight < 50) {
      page.value++
      loadMessages()
    }
  }

  watch(
    () => [props.type, props.filter],
    () => {
      messages.value = []
      page.value = 1
      loadMessages()
    }
  )

  onMounted(() => {
    loadMessages()
  })
</script>
