import { app } from "../../scripts/app.js";
import { getCookie, getIsServerMode } from "./subassembly/tools.js";

const createModelFetchExtension = (endpoint, app, __this) => {
    const modelWidget = __this.widgets.find((w) => w.name === "model");

    const fetchModels = async () => {
        try {
            // 首先检查服务器模式
            const isServerMode = await getIsServerMode();
            
            if (isServerMode) {
                // 服务器模式，需要token
                return new Promise((resolve) => {
                    const checkToken = () => {
                        const token = getCookie("auth_token") || getCookie("bizy_token");
                        if (token) {
                            clearInterval(timer);
                            fetchWithToken(token).then(resolve);
                        }
                    };
                    
                    const timer = setInterval(checkToken, 300);
                    checkToken(); // 立即执行一次检查
                });
            } else {
                // 非服务器模式，直接发送请求
                return fetchWithToken();
            }
        } catch (error) {
            console.error(`Error fetching models`, error);
            return [];
        }
    };

    const fetchWithToken = async (token) => {
        try {
            const headers = {
                "Content-Type": "application/json"
            };
            
            // 只有在token存在时才添加Authorization头
            if (token) {
                headers["Authorization"] = token;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({}),
            });

            if (response.ok) {
                const models = await response.json();
                
                return models;
            } else {
                
                return [];
            }
        } catch (error) {
            console.error(`Error fetching models`, error);
            return [];
        }
    };

    const updateModels = async () => {
        const prevValue = modelWidget.value;
        modelWidget.value = "";
        modelWidget.options.values = [];

        const models = await fetchModels();

        modelWidget.options.values = models;
        

        if (models.includes(prevValue)) {
            modelWidget.value = prevValue; // stay on current.
        } else if (models.length > 0) {
            modelWidget.value = models[0]; // set first as default.
        }

        
        app.graph.setDirtyCanvas(true);
    };

    const dummy = async () => {
        // calling async method will update the widgets with actual value from the browser and not the default from Node definition.
    };

    // Initial update
    dummy(); // this will cause the widgets to obtain the actual value from web page.
    updateModels();
};

// ========== Silicon Cloud Models Extension ==========
// 配置映射：统一管理 LLM 和 VLM 的 API 端点
const SILICONCLOUD_MODELS_CONFIG = {
    'BizyAirSiliconCloudLLMAPI': {
        endpoint: '/bizyair/get_silicon_cloud_llm_models',
        name: 'LLM'
    },
    'BizyAirSiliconCloudVLMAPI': {
        endpoint: '/bizyair/get_silicon_cloud_vlm_models',
        name: 'VLM'
    }
};

// 统一的 Extension - 使用 nodeCreated 钩子避免原型覆盖冲突
app.registerExtension({
    name: 'bizyair.siliconcloud.models.llmOrVlm',

    async nodeCreated(node, app) {
        const config = SILICONCLOUD_MODELS_CONFIG[node.comfyClass];

        if (config && !node._bizyair_model_initialized) {
            node._bizyair_model_initialized = true;

            // 使用 setTimeout 确保 widgets 已经完全初始化
            setTimeout(() => {
                try {
                    createModelFetchExtension(config.endpoint, app, node);
                } catch (error) {
                    console.error(`[BizyAir ${config.name}] Failed to create model fetch extension:`, error);
                }
            }, 0);
        }
    },

    async loadedGraphNode(node, app) {
        // 处理从工作流加载的节点
        const config = SILICONCLOUD_MODELS_CONFIG[node.comfyClass];

        if (config && !node._bizyair_model_initialized) {
            node._bizyair_model_initialized = true;

            setTimeout(() => {
                try {
                    createModelFetchExtension(config.endpoint, app, node);
                } catch (error) {
                    console.error(`[BizyAir ${config.name}] Failed to load model fetch extension:`, error);
                }
            }, 0);
        }
    }
});
