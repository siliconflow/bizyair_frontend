import { app } from "../../scripts/app.js";
import { addPriceBadgeToNode, hasModelInput } from "./model_price.js";

// 用于存储模型类型的属性名（会被序列化保存到工作流中）
const BIZYAIR_MODEL_TYPE_KEY = "bizyair_model_type";

// 获取node 的模型配置input
export async function applyBadgeToNode(_this, forceRefresh = false) {
  // 如果不是强制刷新，优先从节点属性中恢复模型类型（用于工作流加载场景）
  if (!forceRefresh && _this.properties && _this.properties[BIZYAIR_MODEL_TYPE_KEY]) {
    const modelType = _this.properties[BIZYAIR_MODEL_TYPE_KEY];
    await addPriceBadgeToNode(_this, modelType);
    return;
  }

  // 为包含model输入的节点添加价格徽章
  const hiddenOutput = hasModelInput(_this);
  
  if (hiddenOutput) {
    if (!hiddenOutput.type) {
      console.error(`[modelPrice] error finding model type`);
      return;
    }

    if (typeof hiddenOutput.type !== "string") {
      return;
    }

    // 解析模型类型（传入节点对象以获取用户选择的model）
    const modelType = getModelTypeFromHiddenInput(hiddenOutput, _this);
    
    // 将hiddenOutput临时存储在节点上，方便后续使用
    _this._bizyairHiddenOutput = hiddenOutput;

    // 将模型类型存储到节点属性中，确保保存工作流时能被序列化
    if (!_this.properties) {
      _this.properties = {};
    }
    _this.properties[BIZYAIR_MODEL_TYPE_KEY] = modelType;

    await addPriceBadgeToNode(_this, modelType);

    // 删除无用的outputs
    _this.outputs = _this.outputs.filter(
      (output) => output.name !== hiddenOutput.name
    );
  }
}

// 从hiddenInput中获取模型类型
function getModelTypeFromHiddenInput(hiddenOutput, node){
  const modelJson = JSON.parse(hiddenOutput.type);
  
  // 从节点的widgets中获取用户选择的model
  let selectedModel = null;
  const possibleWidgetNames = ["model", "model_name"];
  
  if (node.widgets && Array.isArray(node.widgets)) {
    for (const widget of node.widgets) {
      if (possibleWidgetNames.includes(widget.name) && widget.value) {
        selectedModel = widget.value;
        break;
      }
    }
  }
  
  // 如果找到了用户选择的model，使用它作为key
  if (selectedModel && modelJson[selectedModel]) {
    return modelJson[selectedModel];
  }
  
  // 如果没找到或key不存在，回退到使用第一个键（兼容旧逻辑）
  const modelsList = Object.keys(modelJson);
  return modelJson[modelsList[0]];
}

// 自定义节点创建处理函数
function onNodeCreatedGettingPrice(originalOnNodeCreated) {
  // 调用原始的 onNodeCreated 方法
  if (originalOnNodeCreated) {
    originalOnNodeCreated.apply(this, arguments);
  }
  
  // 延迟执行，确保节点完全创建后再添加badge
  Promise.resolve().then(() => {
    applyBadgeToNode(this);
  });
}

app.registerExtension({
  name: "bizyair.hook.load.nodes",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    // 在节点创建后添加价格徽章（用于首次创建节点）
    const originalOnNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      return onNodeCreatedGettingPrice.call(this, originalOnNodeCreated);
    };

    // 在节点配置后也添加价格徽章（用于从工作流加载节点）
    const originalOnConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function (info) {
      // 先调用原始的 onConfigure
      if (originalOnConfigure) {
        originalOnConfigure.apply(this, arguments);
      }

      // 延迟执行badge添加，确保节点完全配置后再添加
      Promise.resolve().then(() => {
        // 检查节点是否有保存的模型类型
        if (this.properties && this.properties[BIZYAIR_MODEL_TYPE_KEY]) {
          applyBadgeToNode(this);
        } else {
          // 如果没有保存的模型类型，检查是否是BizyAir节点（兼容旧工作流）
          const hiddenOutput = hasModelInput(this);
          if (hiddenOutput) {
            applyBadgeToNode(this);
          }
        }
      });
    };
  },
});
