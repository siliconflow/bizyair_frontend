import { app } from "../../scripts/app.js";
import { getCookie, getIsServerMode } from "./subassembly/tools.js";

function chainCallback(originalCallback, newCallback) {
  return function (...args) {
    if (originalCallback) {
      originalCallback.apply(this, args);
    }
    newCallback.apply(this, args);
  };
}

const createModelFetchExtension = (endpoint, app, node) => {
  const modelWidget = node.widgets.find((w) => w.name === "model");

  const fetchModels = async () => {
    try {
      const isServerMode = await getIsServerMode();
      let token = null;
      if (isServerMode) {
        token = getCookie("bizy_token") || getCookie("auth_token");
      }

      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = token;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const result = await response.json();
        return result?.data?.nodes || {};
      } else {
        return {};
      }
    } catch (error) {
      console.error(`Error fetching models`, error);
      return {};
    }
  };

  const updateModels = async () => {
    const modelMap = await fetchModels();
    const models = Object.keys(modelMap);

    if (modelWidget) {
      const prevValue = modelWidget.value;
      modelWidget.options.values = models;

      if (models.includes(prevValue)) {
        modelWidget.value = prevValue;
      } else if (models.length > 0) {
        modelWidget.value = models[0];
      }
    }

    const output = node.outputs?.find((o) => o.name === "bizyair_model_name");
    if (output) {
      output.type = JSON.stringify(modelMap);
    }

    app.graph.setDirtyCanvas(true);
  };

  updateModels();
};

function initializeDynamicInputs(node) {
  if (node.comfyClass !== "BizyAir_TRD_VLM_API" && node.comfyClass !== "TRD_VLM_API") return;

  node._type = "IMAGE";

  if (!node.inputs) {
    node.inputs = [];
  }

  const updateButton = node.widgets?.find((w) => w.name === "Update inputs");
  if (updateButton) return;

  node.addWidget("button", "Update inputs", null, () => {
    const inputCountWidget = node.widgets?.find((w) => w.name === "inputcount");
    if (!inputCountWidget) return;

    const target_number_of_inputs = inputCountWidget.value || 1;
    const num_inputs = node.inputs.filter((input) => input.type === node._type).length;

    if (target_number_of_inputs === num_inputs) return;

    if (target_number_of_inputs < num_inputs) {
      const inputs_to_remove = num_inputs - target_number_of_inputs;
      for (let i = 0; i < inputs_to_remove; i++) {
        node.removeInput(node.inputs.length - 1);
      }
    } else {
      for (let i = num_inputs + 1; i <= target_number_of_inputs; ++i) {
        node.addInput(`image_${i}`, node._type);
      }
    }
  });
}

app.registerExtension({
  name: "bizyair.third_party_vlm_api",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "BizyAir_TRD_VLM_API" && nodeData.name !== "TRD_VLM_API") return;

    const originalOnNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      const result = originalOnNodeCreated?.apply(this, arguments);
      initializeDynamicInputs(this);
      setTimeout(() => {
        createModelFetchExtension("/bizyair/trd_nodes?type=image2text", app, this);
      }, 0);
      return result;
    };

    const originalOnConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = chainCallback(
      originalOnConfigure,
      function (info) {
        initializeDynamicInputs(this);
        setTimeout(() => {
          createModelFetchExtension("/bizyair/trd_nodes?type=image2text", app, this);
        }, 0);
      }
    );
  },
  nodeCreated(node) {
    if (node.comfyClass === "BizyAir_TRD_VLM_API" || node.comfyClass === "TRD_VLM_API") {
      initializeDynamicInputs(node);
      setTimeout(() => {
        createModelFetchExtension("/bizyair/trd_nodes?type=image2text", app, node);
      }, 0);
    }
  },
  async loadedGraphNode(node, app) {
    if (node.comfyClass === "BizyAir_TRD_VLM_API" || node.comfyClass === "TRD_VLM_API") {
      initializeDynamicInputs(node);
      setTimeout(() => {
        createModelFetchExtension("/bizyair/trd_nodes?type=image2text", app, node);
      }, 0);
    }
  },
});

