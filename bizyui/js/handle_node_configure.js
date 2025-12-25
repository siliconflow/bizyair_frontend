import { app } from "../../scripts/app.js";
import { applyBadgeToNode } from "./handle_load_nodes.js";
import { hasModelInput } from "./model_price.js";
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
        widget.callback = async function () {
          // 用户手动修改widget时，强制刷新badge（不使用缓存的模型类型）
          await applyBadgeToNode(node, true);
        };
      });
    }
  },
});