import { app, ComfyApp } from "../../scripts/app.js";
import { api } from "../../../scripts/api.js";

// 将函数移到扩展对象外部以便全局可访问
async function handleFile(json_data) {
    const jsonContent = json_data

    await app.loadGraphData(
        jsonContent,
        true,
        false,
        "convert_test"
      );
}

// 检查是否为服务器模式
async function isServerMode() {
        const serverModeResponse = await fetch("/bizyair/server_mode");
        const serverModeData = await serverModeResponse.json();
        return serverModeData.data.server_mode === true;
}

async function convert(){
    console.log("开始执行convert函数");
    const p2 = await app.graphToPrompt();
    const json = JSON.stringify(p2["workflow"], null, 2);
    console.log('json数据准备完成');
    // alert('正在执行convert函数');
    await api.fetchApi("/bizyair/node_converter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: json
      }).then(response => response.json())
      .then(data => handleFile(data))
      .catch(error => console.error("Error:", error));
}

// 全局变量，用于节流控制
let lastConvertTime = 0;
const MIN_CONVERT_INTERVAL = 3000; // 最小间隔3秒

// 节流函数：确保convert不会被频繁调用
async function throttledConvert() {
    // 首先检查是否为服务器模式
    const serverMode = await isServerMode();
    if (!serverMode) {
        return;
    }
    
    const now = Date.now();
    if (now - lastConvertTime > MIN_CONVERT_INTERVAL) {
        lastConvertTime = now;
        console.log("节点变化，调用convert");
        convert();
    } else {
        console.log("节点变化，但由于间隔太短，跳过convert调用");
    }
}

app.registerExtension({
    name: "bizyair.tool",
    setup() {
        console.log('BizyAir Tools extension setup');
        
        // 添加菜单选项
        const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
        LGraphCanvas.prototype.getCanvasMenuOptions = function () {
            const options = orig.apply(this, arguments);
            options.push(null, {
                content: "BizyAir Tools",
                submenu: {
                    options: [
                        {
                            content: "convert to bizyair node",
                            callback: async () => {
                                await convert()
                            },
                        },
                    ],
                },
            });
            return options;
        };             
        // 监听从导入
        const origLoadGraphData = app.loadGraphData;
        if (origLoadGraphData) {
            app.loadGraphData = async function() {
                const result = origLoadGraphData.apply(this, arguments);
                console.log("从文件加载图表");              
                // 检查是否为服务器模式
                const serverMode = await isServerMode();
                if (serverMode) {
                    console.log("服务器模式，将在图表加载后调用convert");
                    setTimeout(() => {
                        throttledConvert();
                    }, 500); 
                } else {
                    console.log("非服务器模式，跳过图表加载后的convert调用");
                }             
                return result;
            };
        }
    },  
    // 添加init钩子，在ComfyUI页面完全初始化后调用convert函数
    init() {
        console.log('BizyAir Tools initializing...');
        lastConvertTime = Date.now(); // 记录初始化时间   
        // 检查是否为服务器模式
        setTimeout(async () => {
            const serverMode = await isServerMode();
            if (serverMode) {
                console.log('服务器模式，页面初始化完成，调用convert');
                convert();
            } else {
                console.log('非服务器模式，跳过初始化时的convert调用');
            }
        }, 500); 
    }
});
