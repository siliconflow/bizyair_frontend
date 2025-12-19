import { app } from "../../scripts/app.js";
import { addPriceBadgeToNode, hasModelInput } from "./model_price.js";

// 获取node 的模型配置input
export async function applyBadgeToNode(_this) {
  // 为包含model输入的节点添加价格徽章
  const hiddenOutput = hasModelInput(_this);
  if (hiddenOutput) {
    if (!hiddenOutput.type) {
      console.error(`error finding model type`);
      return;
    }

    if (typeof hiddenOutput.type !== "string") {
      return;
    }

    // 将hiddenOutput临时存储在节点上，方便后续使用
    _this._bizyairHiddenOutput = hiddenOutput;

    await addPriceBadgeToNode(_this, getModelTypeFromHiddenInput(hiddenOutput));

    // 删除无用的outputs
    _this.outputs = _this.outputs.filter(
      (output) => output.name !== hiddenOutput.name
    );
  }
}

// 从hiddenInput中获取模型类型
function getModelTypeFromHiddenInput(hiddenOutput){
  const modelJson = JSON.parse(hiddenOutput.type);
  const modelsList = Object.keys(modelJson);
  return modelJson[modelsList[0]]
}

// 自定义节点创建处理函数
async function onNodeCreatedGettingPrice(originalOnNodeCreated) {
  // 调用原始的 onNodeCreated 方法
  if (originalOnNodeCreated) {
    originalOnNodeCreated.apply(this, arguments);
  }
  applyBadgeToNode(this);
}

app.registerExtension({
  name: "bizyair.hook.load.nodes",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    console.log("[handleLoadNodes] beforeRegisterNodeDef ready", true);

    // 在节点创建后添加价格徽章
    const originalOnNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      return onNodeCreatedGettingPrice.call(this, originalOnNodeCreated);
    };
  },
});
