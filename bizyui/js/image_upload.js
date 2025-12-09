import { app } from "../../../scripts/app.js";
/*
  BizyAir_Seedream4_5
  BizyAir_NanoBananaPro
  BizyAir_NanoBananaProOfficial
  以上三个节点添加多图片上传功能
*/
// 简单的链式callback实现
function chainCallback(originalCallback, newCallback) {
  return function (...args) {
    if (originalCallback) {
      originalCallback.apply(this, args);
    }
    newCallback.apply(this, args);
  };
}

// 统一的函数：初始化动态输入相关的 widgets
function initializeDynamicInputs(node) {
  // 只处理目标节点类型（使用 comfyClass 或 type 来匹配）
  const nodeIdentifier = node.comfyClass || node.type;
  if (
    nodeIdentifier !== "BizyAir_Seedream4_5" &&
    nodeIdentifier !== "BizyAir_NanoBananaPro" &&
    nodeIdentifier !== "BizyAir_NanoBananaProOfficial"
  ) {
    return;
  }

  node._type = "IMAGE";

  if (!node.inputs) {
    node.inputs = [];
  }

  // 先检查是否存在 inputcount widget
  let inputCountWidget = node.widgets?.find(
    (w) => w.name === "inputcount"
  );

  // 如果不存在，先创建 inputcount widget（在按钮之前创建，确保显示顺序）
  if (!inputCountWidget) {
    // 计算当前 IMAGE 类型输入数量
    const currentImageInputs = node.inputs.filter(
      (input) => input.type === node._type
    ).length;
    // 创建 inputcount widget，默认值为当前输入数量或1
    // 使用 precision: 0 确保是整数类型
    inputCountWidget = node.addWidget(
      "number",
      "inputcount",
      currentImageInputs || 1,
      null,
      {
        min: 1,
        max: 10,
        step: 10, // 旧参数（兼容性），是 step2 的 10 倍
        step2: 1, // 新参数，实际的步长
        precision: 0, // 设置为 0 表示整数
      }
    );
  }

  // 检查是否已经存在 "Update inputs" 按钮，避免重复添加
  const updateButton = node.widgets?.find(
    (w) => w.name === "Update inputs"
  );
  if (updateButton) {
    return; // 已经存在，不需要重复添加
  }

  // 然后添加 "Update inputs" 按钮（会在 inputcount 之后显示）
  node.addWidget("button", "Update inputs", null, () => {
    if (!node.inputs) {
      node.inputs = [];
    }

    // 查找 inputcount widget
    const inputCountWidget = node.widgets?.find(
      (w) => w.name === "inputcount"
    );

    // 如果仍然找不到，创建它
    if (!inputCountWidget) {
      const currentImageInputs = node.inputs.filter(
        (input) => input.type === node._type
      ).length;
      node.addWidget(
        "number",
        "inputcount",
        currentImageInputs || 1,
        null,
        {
          min: 1,
          max: 10,
          step: 10, // 旧参数（兼容性），是 step2 的 10 倍
          step2: 1, // 新参数，实际的步长
          precision: 0, // 设置为 0 表示整数
        }
      );
      return;
    }

    const target_number_of_inputs = inputCountWidget.value || 1;
    const num_inputs = node.inputs.filter(
      (input) => input.type === node._type
    ).length;

    if (target_number_of_inputs === num_inputs) {
      return; // already set, do nothing
    }

    if (target_number_of_inputs < num_inputs) {
      const inputs_to_remove = num_inputs - target_number_of_inputs;
      for (let i = 0; i < inputs_to_remove; i++) {
        node.removeInput(node.inputs.length - 1);
      }
    } else {
      for (let i = num_inputs + 1; i <= target_number_of_inputs; ++i) {
        node.addInput(`image_${i}`, node._type, { shape: 7 });
      }
    }
  });
}

app.registerExtension({
  name: "bizyair.dynamicImageInputs",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    // 只处理目标节点类型
    if (
      nodeData.name !== "BizyAir_Seedream4_5" &&
      nodeData.name !== "BizyAir_NanoBananaPro" &&
      nodeData.name !== "BizyAir_NanoBananaProOfficial"
    ) {
      return;
    }

    // 使用 onNodeCreated 原型方法（同步执行，确保在节点创建时立即初始化）
    const originalOnNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      try {
        const result = originalOnNodeCreated?.apply(this, arguments);
        // 在节点创建时初始化 widgets
        initializeDynamicInputs(this);
        return result;
      } catch (error) {
        console.error("[bizyair.dynamicImageInputs] Error in onNodeCreated:", error);
      }
    };

    // 使用 chainCallback 设置 onConfigure，确保在节点配置完成后也初始化 widgets（用于从 JSON 恢复时）
    const originalOnConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = chainCallback(
      originalOnConfigure,
      function (info) {
        // 在 configure 完成后初始化 widgets
        initializeDynamicInputs(this);
      }
    );
  },
  nodeCreated(node) {
    // 在节点创建时也初始化 widgets（作为备份，用于首次创建节点时）
    // 注意：这是异步的，可能在其他扩展之后执行
    initializeDynamicInputs(node);
  },
});
