import { app } from "../../scripts/app.js";
import { getCookie } from "./subassembly/tools.js";

const createModelFetchExtension = (nodeName, endpoint) => {
    return {
        name: `bizyair.siliconcloud.${nodeName.toLowerCase()}.api.model_fetch`,
        async beforeRegisterNodeDef(nodeType, nodeData, app) {
            if (nodeData.name === nodeName) {
                const originalNodeCreated = nodeType.prototype.onNodeCreated;
                nodeType.prototype.onNodeCreated = async function () {
                    if (originalNodeCreated) {
                        originalNodeCreated.apply(this, arguments);
                    }

                    const modelWidget = this.widgets.find((w) => w.name === "model");

                    const fetchModels = async () => {
                        try {
                            // 首先检查服务器模式
                            const serverModeResponse = await fetch("/bizyair/server_mode");
                            const serverModeData = await serverModeResponse.json();
                            
                            if (serverModeData.data.server_mode) {
                                // 服务器模式，需要token
                                return new Promise((resolve) => {
                                    const checkToken = () => {
                                        const token = getCookie("bizy_token");
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
                            console.error(`Error fetching ${nodeName} models`, error);
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
                                console.debug(`Fetched ${nodeName} models:`, models);
                                return models;
                            } else {
                                console.error(`Failed to fetch ${nodeName} models: ${response.status}`);
                                return [];
                            }
                        } catch (error) {
                            console.error(`Error fetching ${nodeName} models`, error);
                            return [];
                        }
                    };

                    const updateModels = async () => {
                        const prevValue = modelWidget.value;
                        modelWidget.value = "";
                        modelWidget.options.values = [];

                        const models = await fetchModels();

                        modelWidget.options.values = models;
                        console.debug(`Updated ${nodeName} modelWidget.options.values:`, modelWidget.options.values);

                        if (models.includes(prevValue)) {
                            modelWidget.value = prevValue; // stay on current.
                        } else if (models.length > 0) {
                            modelWidget.value = models[0]; // set first as default.
                        }

                        console.debug(`Updated ${nodeName} modelWidget.value:`, modelWidget.value);
                        app.graph.setDirtyCanvas(true);
                    };

                    const dummy = async () => {
                        // calling async method will update the widgets with actual value from the browser and not the default from Node definition.
                    };

                    // Initial update
                    await dummy(); // this will cause the widgets to obtain the actual value from web page.
                    await updateModels();
                };
            }
        },
    };
};

// LLM Extension
app.registerExtension(
    createModelFetchExtension(
        "BizyAirSiliconCloudLLMAPI",
        "/bizyair/get_silicon_cloud_llm_models"
    )
);

// VLM Extension
app.registerExtension(
    createModelFetchExtension(
        "BizyAirSiliconCloudVLMAPI",
        "/bizyair/get_silicon_cloud_vlm_models"
    )
);
