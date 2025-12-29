import { app } from "../../scripts/app.js";
import { applyBadgeToNode } from "./handle_load_nodes.js";
import { hasModelInput } from "./model_price.js";

// 链式callback实现，保留原始callback并添加新callback
function chainCallback(originalCallback, newCallback) {
  return async function (...args) {
    // 先执行原始callback
    if (originalCallback) {
      const result = originalCallback.apply(this, args);
      // 如果原始callback返回Promise，等待它完成
      if (result && typeof result.then === 'function') {
        await result;
      }
    }
    // 然后执行新callback
    await newCallback.apply(this, args);
  };
}

app.registerExtension({
  name: "bizyair.handle.node.configure",
  nodeCreated(node, app) {
    // 在这里可以拿到变化之后的值，并且也可以拿到node，这时候给node切换badge即可
    if (node && node.widgets && Array.isArray(node.widgets)) {
      if (!hasModelInput(node)) {
        return;
      }
      // 不仅仅是切换model才会修改模型定价，比如切换输入参数也会修改模型定价
      node.widgets.forEach((widget) => {
        // 保存原始callback，使用链式callback保留原始功能
        const originalCallback = widget.callback;
        widget.callback = chainCallback(originalCallback, async function () {
          // 用户手动修改widget时，强制刷新badge（不使用缓存的模型类型）
          await applyBadgeToNode(node, true);
        });
      });
    }
  },
});