import { app } from "../../scripts/app.js";
import { applyBadgeToNode } from "./handle_load_nodes.js";
app.registerExtension({
  name: "bizyair.handle.node.configure",
  nodeCreated(node, app) {
    // const possibleWidgetNames = ["model_name", "model"];
    // 在这里可以拿到变化之后的值，并且也可以拿到node，这时候给node切换badge即可
    if (node && node.widgets && Array.isArray(node.widgets)) {
      // 只有model选择的widget才注册callback函数
      // 不仅仅是切换model才会修改模型定价，比如切换输入参数也会修改模型定价
      node.widgets.forEach((widget) => {
        widget.callback = async function () {
            await applyBadgeToNode(node);
          };
        // if (possibleWidgetNames.includes(widget.name)) {
        // widget.callback = async function () {
        //   await applyBadgeToNode(node);
        // };
        // }
      });
    }
  },
});