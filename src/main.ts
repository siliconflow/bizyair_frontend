import { createApp } from 'vue'
import './assets/shadcn.css'
import './assets/index.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { ModelSelect } from '@/components/model-select/'
import dialogList from '@/views/btnTrain/dataset/dialogList.vue'
import { createI18n } from 'vue-i18n'
import enMessages from './locales/en.json'
import zhMessages from './locales/zh.json'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useServerModeStore } from '@/stores/isServerMode'

// 创建i18n实例
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en: enMessages,
    zh: zhMessages
  }
})

export const logNodeInfo = (nodeInfo: {
  title: string
  type: string
  id?: string
  imageInfo?: {
    filename: string
    url: string
    path: string
  } | null
}) => {
  console.log('节点信息已接收:', nodeInfo)

  try {
    // 使用app中已创建的pinia实例
    const sidebarStore = useSidebarStore()

    // 使用store更新节点信息，但不打开侧边栏
    sidebarStore.setNodeInfo({
      title: nodeInfo.title,
      type: nodeInfo.type,
      id: nodeInfo.id || '',
      imageInfo: nodeInfo.imageInfo || null
    })

    // 打开侧边栏
    // sidebarStore.openSidebar();

    console.log('节点信息已同步到store:', nodeInfo, '侧边栏状态保持不变')
  } catch (error) {
    console.error('同步节点信息到store时出错:', error)
  }
}

export const showModelSelect = (options: { [x: string]: unknown } | null | undefined) => {
  let isMounted = false
  const uniqueId = `bizyair-model-select-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const container = document.createElement('div')
  container.id = uniqueId
  document.body.appendChild(container)
  const app = createApp(ModelSelect, {
    ...options,
    onClose: () => {
      if (isMounted) {
        app.unmount()
        isMounted = false
      }
      if (document.body.contains(container)) {
        document.body.removeChild(container)
      }
    },
    onApply: (...args: unknown[]) => {
      if (options?.onApply) {
        ;(options.onApply as (...args: unknown[]) => void)(...args)
        if (isMounted) {
          app.unmount()
          isMounted = false
        }
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }
    }
  })
  app.directive('debounce', {
    mounted(el, binding) {
      let timer: any = null

      const handleEvent = () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(
          () => {
            binding.value()
          },
          (binding.arg as unknown as number) || 500
        )
      }

      el.addEventListener('keyup', (event: KeyboardEvent) => {
        if (
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.key === 'Alt' ||
          event.key === 'Control' ||
          event.key === 'Shift' ||
          event.key === 'Tab'
        ) {
          return
        }
        handleEvent()
      })

      el.addEventListener('input', (event: InputEvent) => {
        if (event.inputType === 'insertFromPaste' || event.inputType === 'deleteByCut') {
          handleEvent()
        }
      })
    },

    unmounted(el, binding) {
      el.removeEventListener('keyup', binding.value)
      el.removeEventListener('input', binding.value)
    }
  })
  app.use(i18n)
  const instance = app.mount(container)
  isMounted = true
  return {
    instance
  }
}

export const showDatasetSelect = (options: { [x: string]: unknown } | null | undefined) => {
  const uniqueId = `bizyair-dataset-select-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const container = document.createElement('div')
  container.id = uniqueId
  document.body.appendChild(container)
  const app = createApp(dialogList, {
    ...options,
    showDatasetSelect: true,
    isNodeSelect: true,
    onClose: function () {
      app.unmount()
      console.log('this-----------', this)
      if (document.body.contains(container)) {
        document.body.removeChild(container)
      }
    },
    onApply: (...args: unknown[]) => {
      if (options?.onApply) {
        ;(options.onApply as (...args: unknown[]) => void)(...args)

        app.unmount()

        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }
    }
  })

  app.directive('debounce', {
    mounted(el, binding) {
      let timer: any = null
      el.addEventListener('keyup', () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(
          () => {
            binding.value()
          },
          (binding.arg as unknown as number) || 500
        )
      })
    },
    unmounted(el, binding) {
      if (binding) {
        el.removeEventListener('keyup', binding.value)
      }
    }
  })
  app.use(i18n)
  const instance = app.mount(container)

  return {
    instance
  }
}

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.directive('debounce', {
  mounted(el, binding) {
    let timer: any = null

    const handleEvent = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(
        () => {
          binding.value()
        },
        (binding.arg as unknown as number) || 500
      )
    }

    el.addEventListener('keyup', (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.key === 'Alt' ||
        event.key === 'Control' ||
        event.key === 'Shift' ||
        event.key === 'Tab'
      ) {
        return
      }
      handleEvent()
    })

    el.addEventListener('input', (event: InputEvent) => {
      if (event.inputType === 'insertFromPaste' || event.inputType === 'deleteByCut') {
        handleEvent()
      }
    })
  },

  unmounted(el, binding) {
    el.removeEventListener('keyup', binding.value)
    el.removeEventListener('input', binding.value)
  }
})

export function mount(container: string | Element, comfyUIApp?: any) {
  app.provide('comfyUIApp', comfyUIApp)
  const serverModeStore = useServerModeStore()
  serverModeStore.setIsServerMode().then((e) => {
    if (!e) {
      app.use(i18n)
      app.mount(container)
    } else {
        const timer = setInterval(() => {
        const authToken = document.cookie
          .split(';')
          .find(cookie => cookie.trim().startsWith('bizy_token='))
        if (authToken) {
          clearInterval(timer)
          app.use(i18n)
          app.mount(container)
        }
      }, 300)
    }
  })
  // server_mode().then(res => {
  //   if (!res.data.server_mode) {
  //     app.use(i18n)
  //     app.mount(container)
  //   } else {
  //     const timer = setInterval(() => {
  //       const authToken = document.cookie
  //         .split(';')
  //         .find(cookie => cookie.trim().startsWith('bizy_token='))
  //       if (authToken) {
  //         clearInterval(timer)
  //         app.use(i18n)
  //         app.mount(container)
  //       }
  //     }, 300)
  //   }
  // })
}

export function unmount() {
  if (!app) {
    return
  }
  app.unmount()
}

if (import.meta.env.MODE !== 'production') {
  mount('#app')
}

// 确保将函数暴露到全局bizyAirLib对象中
declare global {
  interface Window {
    bizyAirLib: {
      showModelSelect: typeof showModelSelect
      showDatasetSelect: typeof showDatasetSelect
      logNodeInfo: typeof logNodeInfo
      [key: string]: any
    }
  }
}

// 初始化全局bizyAirLib对象
if (typeof window !== 'undefined') {
  window.bizyAirLib = window.bizyAirLib || {}
  window.bizyAirLib.showModelSelect = showModelSelect
  window.bizyAirLib.showDatasetSelect = showDatasetSelect
  window.bizyAirLib.logNodeInfo = logNodeInfo
}
