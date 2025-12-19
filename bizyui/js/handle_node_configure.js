import { app } from "../../scripts/app.js";
import { applyBadgeToNode } from "./handle_load_nodes.js";
app.registerExtension({
  name: "bizyair.handle.node.configure",
  nodeCreated(node, app) {
    // 简单的节点配置处理逻辑
    console.log("Node created:", node);
    // 在这里可以拿到变化之后的值，并且也可以拿到node，这时候给node切换badge即可
    if (node && node.widgets && Array.isArray(node.widgets)) {
      // 只有model选择的widget才注册callback函数
      node.widgets.forEach((widget) => {
        if (widget.name === "model_name") {
          widget.callback = async function () {
            await applyBadgeToNode(node);
          };
        }
      });
    }
  },
});