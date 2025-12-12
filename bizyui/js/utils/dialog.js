// 原生的 ComfyDialog 类实现，提取自 ComfyUI_frontend/src/scripts/ui/dialog.ts
// 用于替代废弃的 scripts/ui.js 中的 ComfyDialog

import { $el } from './el.js'

export class ComfyDialog extends EventTarget {
  constructor(type = 'div', buttons = null) {
    super()
    this._buttons = buttons
    this.element = $el(type + '.comfy-modal', { parent: document.body }, [
      $el('div.comfy-modal-content', [
        $el('p', { $: (p) => (this.textElement = p) }),
        ...this.createButtons()
      ])
    ])
  }

  createButtons() {
    return (
      this._buttons ?? [
        $el('button', {
          type: 'button',
          textContent: 'Close',
          onclick: () => this.close()
        })
      ]
    )
  }

  close() {
    this.element.style.display = 'none'
  }

  show(html) {
    if (typeof html === 'string') {
      this.textElement.innerHTML = html
    } else {
      this.textElement.replaceChildren(
        ...(html instanceof Array ? html : [html])
      )
    }
    this.element.style.display = 'flex'
  }
}

