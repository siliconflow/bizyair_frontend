import { createApp } from 'vue'
import './assets/shadcn.css'
import './assets/index.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { ModelSelect } from '@/components/model-select/'

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

  const instance = app.mount(container)
  isMounted = true
  return {
    instance
  }
}

const app = createApp(App)
app.use(createPinia())
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
export function mount(container: string | Element, comfyUIApp?: any) {
  app.provide('comfyUIApp', comfyUIApp)

  app.mount(container)
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
