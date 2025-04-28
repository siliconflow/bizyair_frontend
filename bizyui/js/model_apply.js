import { app } from "../../scripts/app.js";

import './bizyair_frontend.js'
import './apply_image_to_node.js'
import { hideWidget } from './subassembly/tools.js'

const possibleWidgetNames=[
    "clip_name",
    "clip_name1",
    "clip_name2",
    "ckpt_name",
    "lora_name",
    "control_net_name",
    "ipadapter_file",
    "unet_name",
    "vae_name",
    "model_name",
    "instantid_file",
    "pulid_file",
    "style_model_name",
]
// 节点点击信息记录器 - 新添加的功能
const NodeInfoLogger = (function() {
    // 节点类型与图片类型的映射
    const NODE_TYPE_MAPPING = {
        'PreviewImage': { type: 'temp', path: 'temp' },
        'SaveImage': { type: 'output', path: 'output' },
        'LoadImage': { type: 'input', path: 'input' }
    };

    // 构建图片URL
    const buildImageUrl = (filename, type) => {
        const baseUrl = window.location.protocol + '//' + window.location.host + "/api/view";
        return `${baseUrl}?filename=${filename}&subfolder=&type=${type}&rand=${Math.random()}`;
    };

    // 获取图片并转换为base64
    const getImageAsBase64 = async (filename, type) => {
        try {
            const imageUrl = buildImageUrl(filename, type);
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`获取图片失败: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Data = reader.result;
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('获取图片并转换为base64失败:', error);
            return null;
        }
    };

    // 构建图片信息对象
    const buildImageInfo = (imageData) => {
        if (!imageData?.filename) return null;

        // 根据节点类型确定图片类型
        const type = imageData.type || 'temp'; // 默认为temp类型
        const path = `/${type}/${imageData.filename}`;

        return {
            filename: imageData.filename,
            url: buildImageUrl(imageData.filename, type),
            path: path,
            type: type
        };
    };

    // 注册应用扩展
    app.registerExtension({
        name: "bizyair.node.info.logger",
        async nodeCreated(node) {
            // 保存原始的onMouseDown方法
            if (!node._originalOnMouseDown) {
                node._originalOnMouseDown = node.onMouseDown;
            }

            // 重写onMouseDown方法
            node.onMouseDown = async function(e, pos, canvas) {
                // 如果不是右键点击，则记录节点信息
                if (e.button === 0) { // 左键点击
                    console.log("节点信息:", {
                        id: this.id,
                        type: this.type,
                        comfyClass: this.comfyClass,
                        title: this.title,
                        inputs: this.inputs,
                        outputs: this.outputs,
                        properties: this.properties,
                        widgets: this.widgets?.map(w => ({
                            name: w.name,
                            value: w.value,
                            type: w.type
                        }))
                    });

                    console.log(this.images, 'this');
                    console.log("节点title:", this.title);
                    console.log("节点type:", this.type);
                    console.log('id', this.id);

                    // 创建基本节点信息对象
                    const nodeInfo = {
                        title: this.title,
                        type: this.type,
                        id: this.id,
                        imageInfo: null
                    };

                    // 处理图片信息并传递给logNodeInfo
                    if (this.images && this.images.length > 0) {
                        const imageInfo = buildImageInfo(this.images[0]);

                        // 检查是否存在全局bizyAirLib对象及logNodeInfo函数
                        if (typeof bizyAirLib !== 'undefined' && typeof bizyAirLib.logNodeInfo === 'function') {
                            try {
                                // 获取图片的base64数据
                                const base64Data = await getImageAsBase64(this.images[0].filename, imageInfo.type);

                                // 添加base64数据到图片信息对象
                                if (base64Data) {
                                    imageInfo.base64 = base64Data;
                                }

                                // 添加图片信息到节点信息对象
                                nodeInfo.imageInfo = imageInfo;

                                console.log("已将节点和图片信息传递到logNodeInfo (包含base64数据):", {
                                    title: this.title,
                                    type: this.type,
                                    id: this.id,
                                    imageInfo: {
                                        ...imageInfo,
                                        base64: base64Data ? '已包含base64数据' : null
                                    }
                                });
                            } catch (error) {
                                console.error("获取图片base64数据失败:", error);
                                // 即使获取base64失败，也添加基本图片信息
                                nodeInfo.imageInfo = imageInfo;
                            }
                        } else {
                            console.error("bizyAirLib.logNodeInfo未定义，无法传递节点信息");
                        }
                    }
                    
                    // 对所有节点都传递信息到前端
                    if (typeof bizyAirLib !== 'undefined' && typeof bizyAirLib.logNodeInfo === 'function') {
                        bizyAirLib.logNodeInfo(nodeInfo);
                    }
                }

                // 调用原始方法，保持原有功能
                return this._originalOnMouseDown?.apply(this, arguments);
            };
        }
    });

    return {
        // 提供一个全局函数，可以在控制台手动调用获取选中节点的信息
        logSelectedNodes: function() {
            const selectedNodes = app.canvas.selected_nodes || [];
            if (selectedNodes.length === 0) {
                console.log("没有选中任何节点");
                return;
            }

            selectedNodes.forEach((node, index) => {
                console.log(`选中节点 ${index + 1}:`, {
                    id: node.id,
                    type: node.type,
                    comfyClass: node.comfyClass,
                    title: node.title,
                    widgets: node.widgets?.map(w => ({
                        name: w.name,
                        value: w.value
                    }))
                });
            });
        }
    };
})();

// 将节点记录器暴露到全局，方便在控制台使用
window.NodeInfoLogger = NodeInfoLogger;

function createSetWidgetCallback(modelType, selectedBaseModels = []) {
    return function setWidgetCallback() {
        const targetWidget = this.widgets.find(widget => possibleWidgetNames.includes(widget.name));
        if (targetWidget) {
            targetWidget.value = targetWidget.value || "to choose"
            targetWidget.mouse = function(e, pos, canvas) {
                try {
                    if (e.type === "pointerdown" || e.type === "mousedown" || e.type === "click" || e.type === "pointerup") {
                        e.preventDefault();
                        e.stopPropagation();
                        e.widgetClick = true;

                        const currentNode = this.node;

                        if (!currentNode || !currentNode.widgets) {
                            console.warn("Node or widgets not available");
                            return false;
                        }

                        if (typeof bizyAirLib !== 'undefined' && typeof bizyAirLib.showModelSelect === 'function') {
                            bizyAirLib.showModelSelect({
                                modelType: [modelType],
                                selectedBaseModels,
                                onApply: (version, model) => {
                                    if (!currentNode || !currentNode.widgets) return;

                                    const currentLora = currentNode.widgets.find(widget => possibleWidgetNames.includes(widget.name));
                                    const currentModel = currentNode.widgets.find(w => w.name === "model_version_id");

                                    if (model && currentModel && version) {
                                        currentLora.value = model;
                                        currentModel.value = version.id;
                                        currentNode.setDirtyCanvas(true);
                                    }
                                }
                            });
                        } else {
                            console.error("bizyAirLib not available");
                        }
                        return false;
                    }
                } catch (error) {
                    console.error("Error handling mouse event:", error);
                }
            };

            targetWidget.node = this;
            targetWidget.options = targetWidget.options || {};
            targetWidget.options.values = () => [];
            targetWidget.options.editable = false;
            targetWidget.clickable = true;
            targetWidget.processMouse = true;
        }
    }
}

function setupNodeMouseBehavior(node, modelType) {
    hideWidget(node, "model_version_id");

    if (!node._bizyairState) {
        node._bizyairState = {
            lastClickTime: 0,
            DEBOUNCE_DELAY: 300,
            original_onMouseDown: node.onMouseDown
        };
    }

    node.onMouseDown = function(e, pos, canvas) {
        if (e.widgetClick) {
            return this._bizyairState.original_onMouseDown?.apply(this, arguments);
        }

        const targetWidget = this.widgets.find(widget => possibleWidgetNames.includes(widget.name));
        if (targetWidget && pos[1] - targetWidget.last_y > 0 && pos[1] - targetWidget.last_y < 20) {
            const litecontextmenu = document.querySelector('.litegraph.litecontextmenu')
            if (litecontextmenu) {
                litecontextmenu.style.display = 'none'
            }
            e.stopImmediatePropagation();
            e.preventDefault();
            if (e.button !== 0) {
                return false;
            }

            const currentTime = new Date().getTime();
            if (currentTime - this._bizyairState.lastClickTime < this._bizyairState.DEBOUNCE_DELAY) {
                return false;
            }
            this._bizyairState.lastClickTime = currentTime;

            const currentNode = this;
            bizyAirLib.showModelSelect({
                modelType: [modelType],
                selectedBaseModels: [],
                onApply: (version, model) => {
                    if (!currentNode || !currentNode.widgets) return;

                    const currentLora = currentNode.widgets.find(widget => possibleWidgetNames.includes(widget.name));
                    const currentModel = currentNode.widgets.find(w => w.name === "model_version_id");

                    if (model && currentModel && version) {
                        currentLora.value = model;
                        currentModel.value = version.id;
                        currentNode.setDirtyCanvas(true);
                    }
                }
            });
            return false;
        } else {
            return this._bizyairState.original_onMouseDown?.apply(this, arguments);
        }
    }
}

const nodeDataNames = {
    LoRA: ["BizyAir_LoraLoader","BizyAir_NunchakuFluxLoraLoader"],
    Controlnet: "BizyAir_ControlNetLoader",
    Checkpoint: "BizyAir_CheckpointLoaderSimple",
    // Clip: "BizyAir_CLIPVisionLoader",
    // Ipadapter: "BizyAir_IPAdapterModelLoade",
    // Unet: "BizyAir_MZ_KolorsUNETLoaderV2",
    // Vae: "BizyAir_VAELoader",
    // Upscale_models: "BizyAir_UpscaleModelLoader",
    // Instantid: "BizyAir_InstantIDModelLoader",
    // Pulid: "BizyAir_PulidFluxModelLoader"
}
app.registerExtension({
    name: "bizyair.siliconcloud.share.lora.loader.new",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        for( const key in nodeDataNames){
            const names = nodeDataNames[key];
            const isMatch = Array.isArray(names) ?
                names.includes(nodeData.name) :
                (nodeData.name === names);

            if(isMatch){
                const onNodeCreated = nodeType.prototype.onNodeCreated;
                nodeType.prototype.onNodeCreated = function() {
                    try {
                        const result = onNodeCreated?.apply(this, arguments);
                        let selectedBaseModels = [];if (nodeData.name === nodeDataNames.Checkpoint) {
                            selectedBaseModels = ['SDXL', 'Pony', 'SD 3.5', 'Illustrious']
                        }
                        createSetWidgetCallback(key, selectedBaseModels).call(this);
                        return result;
                    } catch (error) {
                        console.error("Error in node creation:", error);
                    }
                };
            }
        }
    },

    async nodeCreated(node) {
        for (const key in nodeDataNames) {

            const names = nodeDataNames[key]; //  string | array | undefined
            const isMatch = names ?
                (Array.isArray(names) ? names.includes(node?.comfyClass) : node?.comfyClass === names)
                : false;

            if (isMatch) {
                setupNodeMouseBehavior(node, key);
            }
        }
    }
})
