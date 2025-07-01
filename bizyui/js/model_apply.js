import { app } from "../../scripts/app.js";

import './bizyair_frontend.js'
import './apply_image_to_node.js'
import { hideWidget } from './subassembly/tools.js'
import { getCookie } from './subassembly/tools.js'
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

    // 获取图片并转换为base64（根据 server_mode 判断逻辑）
    const getImageAsBase64 = async (filename, type) => {
        try {
            // 检查服务器模式
            const serverModeResponse = await fetch("/bizyair/server_mode");
            const serverModeData = await serverModeResponse.json();
            
            // 非服务器模式下，如果 filename 已经是 base64 数据，直接返回
            if (!serverModeData.data.server_mode && filename.startsWith('data:')) {
                console.log('本地模式：filename 已经是 base64 数据，直接返回');
                return filename;
            }
            
            let imageUrl;
            let headers = {};
            
            if (serverModeData.data.server_mode) {
                // 服务器模式，改为请求后端转发接口
                imageUrl = `/bizyair/proxy_view?filename=${encodeURIComponent(filename)}`;
            } else {
                // 本地模式，使用原有 buildImageUrl
                imageUrl = buildImageUrl(filename, type);
            }
            
            const response = await fetch(imageUrl, { headers });
            if (!response.ok) {
                throw new Error(`获取图片失败: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();
            // 转 base64
            const file = new File([blob], filename, { type: blob.type });
            const { base64: compressedBase64 } = await formatToWebp(file);
            return compressedBase64;
        } catch (error) {
            console.error('获取图片并转换为base64失败:', error);
            return null;
        }
    };
     const formatToWebp = (file)=> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => {
            const img = new Image()
            img.onload = () => {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              canvas.width = img.width
              canvas.height = img.height
              ctx?.drawImage(img, 0, 0)
              const webpDataUrl = canvas.toDataURL('image/webp')
              resolve({
                file: base64ToFile(webpDataUrl, `${file.name}.webp`, 'image/webp'),
                base64: webpDataUrl
              })
            }
            img.src = e.target?.result 
          }
          reader.onerror = e => {
            reject(e)
          }
          reader.readAsDataURL(file)
        })
      }
       function base64ToFile(base64, filename, mimeType) {
        const byteCharacters = atob(base64.split(',')[1])
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType || base64.split(':')[1].split(';')[0] })
        return new File([blob], filename, { type: blob.type })
      }
    // 构建图片信息对象（根据 server_mode 判断逻辑）
    const buildImageInfo = async (imageData) => {
        if (!imageData?.filename) return null;
        // 检查服务器模式
        const serverModeResponse = await fetch("/bizyair/server_mode");
        const serverModeData = await serverModeResponse.json();
        const type = imageData.type || 'temp';
        const path = `/${type}/${imageData.filename}`;
        let url;
        
        if (serverModeData.data.server_mode) {
            // 服务器模式，使用 view 接口
            url = `/view?filename=${encodeURIComponent(imageData.filename)}`;
        } else {
            // 本地模式，如果 filename 是 base64 数据，直接使用
            if (imageData.filename.startsWith('data:')) {
                url = imageData.filename;
            } else {
                // 否则使用 buildImageUrl 构建 URL
                url = buildImageUrl(imageData.filename, type);
            }
        }
        
        return {
            filename: imageData.filename,
            url: url,
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
            
            // 使用装饰器模式扩展节点的onMouseDown方法
            node.onMouseDown = function(e, pos, canvas) {
                if (this._isServerMode && this.type === 'LoadImage') {
                    return;
                }
                // 对于小部件点击或右键点击，直接使用原始方法处理
                if (e.widgetClick || e.button !== 0) {
                    return this._originalOnMouseDown?.apply(this, arguments);
                }
                
                // 第一步：处理LORA小部件特殊区域点击
                const targetWidget = this.widgets && this.widgets.find(widget => 
                    possibleWidgetNames.includes(widget.name));
                    
                if (targetWidget && pos[1] - targetWidget.last_y > 0 && pos[1] - targetWidget.last_y < 20) {
                    const litecontextmenu = document.querySelector('.litegraph.litecontextmenu');
                    if (litecontextmenu) {
                        litecontextmenu.style.display = 'none';
                    }
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    
                    // 防抖处理
                    if (!this._bizyairState) {
                        this._bizyairState = {
                            lastClickTime: 0,
                            DEBOUNCE_DELAY: 300
                        };
                    }
                    
                    const currentTime = new Date().getTime();
                    if (currentTime - this._bizyairState.lastClickTime < this._bizyairState.DEBOUNCE_DELAY) {
                        return false;
                    }
                    this._bizyairState.lastClickTime = currentTime;
                    
                    // 处理模型选择
                    for (const key in nodeDataNames) {
                        const names = nodeDataNames[key];
                        const isMatch = names ?
                            (Array.isArray(names) ? names.includes(this.comfyClass) : this.comfyClass === names)
                            : false;
                        
                        if (isMatch) {
                            const currentNode = this;
                            bizyAirLib.showModelSelect({
                                modelType: [key],
                                selectedBaseModels: [],
                                onApply: (version, model) => {
                                    if (!currentNode || !currentNode.widgets) return;
                                    
                                    const currentLora = currentNode.widgets.find(widget => 
                                        possibleWidgetNames.includes(widget.name));
                                    const currentModel = currentNode.widgets.find(w => 
                                        w.name === "model_version_id");
                                    
                                    if (model && currentModel && version) {
                                        currentLora.value = model;
                                        currentModel.value = version.id;
                                        currentNode.setDirtyCanvas(true);
                                    }
                                }
                            });
                            break;
                        }
                    }
                    return false;
                }
                
                // 第二步：记录节点信息，但不阻止后续操作
                // 使用微任务队列或setTimeout将日志和信息收集与事件处理分离
                // 这样不会阻塞拖动等操作的开始
                queueMicrotask(() => {
                    // 只有当不处于拖动状态时才记录信息
                    if (!canvas.is_dragging) {
                        // 收集节点信息
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
                            // 使用异步IIFE处理图片，不阻塞主流程
                            (async () => {
                                try {
                                    const imageInfo = await buildImageInfo(this.images[0]);
                                    
                                    // 检查是否存在全局bizyAirLib对象及logNodeInfo函数
                                    if (typeof bizyAirLib !== 'undefined' && typeof bizyAirLib.logNodeInfo === 'function') {
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
                                        
                                        // 发送完整节点信息
                                        bizyAirLib.logNodeInfo(nodeInfo);
                                    } else {
                                        console.error("bizyAirLib.logNodeInfo未定义，无法传递节点信息");
                                    }
                                } catch (error) {
                                    console.error("获取图片base64数据失败:", error);
                                    
                                    // 即使获取base64失败，也尝试发送基本节点信息
                                    if (typeof bizyAirLib !== 'undefined' && typeof bizyAirLib.logNodeInfo === 'function') {
                                        bizyAirLib.logNodeInfo(nodeInfo);
                                    }
                                }
                            })();
                        } else {
                            // 对不包含图片的节点，直接传递信息到前端
                            if (typeof bizyAirLib !== 'undefined' && typeof bizyAirLib.logNodeInfo === 'function') {
                                bizyAirLib.logNodeInfo(nodeInfo);
                            }
                        }
                    }
                });
                
                // 调用原始方法处理拖动等操作
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
    
    // 只设置必要的状态信息，不修改onMouseDown（已在上面的扩展中处理）
    if (!node._bizyairState) {
        node._bizyairState = {
            lastClickTime: 0,
            DEBOUNCE_DELAY: 300,
            modelType: modelType
        };
    }
}

const nodeDataNames = {
    LoRA: ["BizyAir_LoraLoader","BizyAir_NunchakuFluxLoraLoader", "BizyAir_Wan_LoraLoader"],
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