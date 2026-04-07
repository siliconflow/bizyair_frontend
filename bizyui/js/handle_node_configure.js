import { app } from '../../scripts/app.js'
import { applyBadgeToNode } from './handle_load_nodes.js'
import { hasModelInput } from './model_price.js'

// 链式callback实现，保留原始callback并添加新callback
function chainCallback(originalCallback, newCallback) {
  return async function (...args) {
    // 先执行原始callback
    if (originalCallback) {
      const result = originalCallback.apply(this, args)
      // 如果原始callback返回Promise，等待它完成
      if (result && typeof result.then === 'function') {
        await result
      }
    }
    // 然后执行新callback
    await newCallback.apply(this, args)
  }
}

function isTrackedLinkedInput(slot) {
  return Boolean((slot?.name || slot?.localized_name) && slot?.widget === undefined)
}

app.registerExtension({
  name: 'bizyair.handle.node.configure',
  nodeCreated(node, app) {
    // 做忽略的widget 这些widget不做获取价格的操作
    const ignoreWidgets = ['prompt', 'negative_prompt', 'inputcount']
    // 在这里可以拿到变化之后的值，并且也可以拿到node，这时候给node切换badge即可
    if (node && node.widgets && Array.isArray(node.widgets)) {
      if (!hasModelInput(node)) {
        return
      }

      if (!node._bizyairPriceConnectionHooked) {
        const originalOnConnectionsChange = node.onConnectionsChange
        node.onConnectionsChange = chainCallback(
          originalOnConnectionsChange,
          async function (type, slotIndex, isConnected, linkInfo, ioSlot) {
            const inputSlot = this.inputs?.[slotIndex]
            if (!isTrackedLinkedInput(inputSlot)) {
              return
            }

            // 只处理这类输入槽位本身的连线变化，避免误判 output 变化。
            if (ioSlot && ioSlot !== inputSlot) {
              return
            }

            await applyBadgeToNode(node, true)
          }
        )
        node._bizyairPriceConnectionHooked = true
      }

      // 不仅仅是切换model才会修改模型定价，比如切换输入参数也会修改模型定价
      node.widgets.forEach(widget => {
        // 对于prompt这种输入频繁的widget 不做获取价格操作
        if (ignoreWidgets.includes(widget.name) || widget._bizyairManualPriceRefresh === true) {
          return
        }
        // 保存原始callback，使用链式callback保留原始功能
        const originalCallback = widget.callback
        widget.callback = chainCallback(originalCallback, async function () {
          // 用户手动修改widget时，强制刷新badge（不使用缓存的模型类型）
          await applyBadgeToNode(node, true)
        })
      })
    }
  }
})
