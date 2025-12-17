// 原生的 $el 函数实现，提取自 ComfyUI_frontend/src/scripts/ui.ts00
// 用于替代废弃的 scripts/ui.js 中的 $el

function $el(tag, propsOrChildren, children) {
  // 解析标签和类名（例如 "div.class1.class2"）
  const split = tag.split('.')
  const element = document.createElement(split.shift())

  // 添加类名
  if (split.length > 0) {
    element.classList.add(...split)
  }

  if (propsOrChildren) {
    if (typeof propsOrChildren === 'string') {
      propsOrChildren = { textContent: propsOrChildren }
    } else if (propsOrChildren instanceof Element) {
      propsOrChildren = [propsOrChildren]
    }

    if (Array.isArray(propsOrChildren)) {
      element.append(...propsOrChildren)
    } else {
      const { parent, $: cb, dataset, style, ...rest } = propsOrChildren

      // 处理 for 属性（label 的 for 属性）
      if (rest.for) {
        element.setAttribute('for', rest.for)
      }

      // 设置样式
      if (style) {
        Object.assign(element.style, style)
      }

      // 设置 dataset
      if (dataset) {
        Object.assign(element.dataset, dataset)
      }

      // 设置其他属性
      Object.assign(element, rest)

      // 添加子元素
      if (children) {
        element.append(...(Array.isArray(children) ? children : [children]))
      }

      // 添加到父元素
      if (parent) {
        parent.append(element)
      }

      // 执行回调函数
      if (cb) {
        cb(element)
      }
    }
  }

  return element
}

export { $el }
