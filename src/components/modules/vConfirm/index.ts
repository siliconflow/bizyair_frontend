import { createApp, h } from 'vue'
import vConfirm from './index.vue'

export function useConfirm(options: {
  title?: string
  content?: string
  cancelText?: string
  continueText?: string
}) {
  return new Promise(resolve => {
    const container = document.createElement('div')
    const menuNox = document.querySelector('#menu-nox')
    menuNox?.appendChild(container)

    const app = createApp({
      render() {
        return h(vConfirm, {
          ...options,
          onContinueClick: () => {
            resolve(true)
            app.unmount()
            menuNox?.removeChild(container)
          },
          onCancelClick: () => {
            resolve(false)
            app.unmount()
            menuNox?.removeChild(container)
          }
        })
      }
    })

    app.mount(container)
  })
}
