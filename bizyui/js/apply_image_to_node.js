import { app } from "../../scripts/app.js";
import { getCookie } from "./subassembly/tools.js";

function inspectNode(node) {
    console.log('节点信息:', {
        id: node.id,
        type: node.type,
        title: node.title,
        size: node.size
    });
}

// 节点类型与图片类型的映射
const NODE_TYPE_MAPPING = {
    'PreviewImage': { type: 'temp', path: 'temp' },
    'SaveImage': { type: 'output', path: 'output' },
    'LoadImage': { type: 'input', path: 'input' }
};

// 监听来自iframe的消息
window.addEventListener('message', async function(event) {

    if (event.data && event.data.type === 'APPLY_IMAGE_TO_NODE') {
        const { nodeId, base64Data } = event.data.data;
        
        console.log('收到应用图片到节点请求:', nodeId);
        
        if (!nodeId || !base64Data) {
            console.error('应用图片到节点失败: 缺少必要的参数');
            return;
        }
        
        try {
            // 找到目标节点
            const targetNode = app.graph.getNodeById(parseInt(nodeId));
            if (!targetNode) {
                console.error('应用图片到节点失败: 找不到指定ID的节点', nodeId);
                return;
            }
            
            // 检查服务器模式
            const serverModeResponse = await fetch("/bizyair/server_mode");
            const serverModeData = await serverModeResponse.json();
            
            let token = null;
            if (serverModeData.data.server_mode) {
                // 服务器模式，需要token
                token = await new Promise((resolve) => {
                    const checkToken = () => {
                        const token = getCookie("bizy_token");
                        if (token) {
                            clearInterval(timer);
                            resolve(token);
                        }
                    };
                    
                    const timer = setInterval(checkToken, 300);
                    checkToken(); // 立即执行一次检查
                });
            }
            
            // 保存原始节点大小
            const originalSize = targetNode.size ? [...targetNode.size] : null;
            
            // 记录节点基本信息
            inspectNode(targetNode);
            
            // 确定节点类型和对应的图片类型
            const nodeType = targetNode.type || targetNode.comfyClass;
            const mapping = NODE_TYPE_MAPPING[nodeType] || { type: 'temp', path: 'temp' };
            const imageType = mapping.type;
            
            console.log(`节点类型: ${nodeType}, 使用图片类型: ${imageType}`);
            
            // 提取base64
            const cleanBase64Data = base64Data.includes('base64,') 
                ? base64Data.split('base64,')[1] 
                : base64Data;
            
            // 创建一个临时图片文件名
            const timestamp = new Date().getTime();
            const randomStr = Math.random().toString(36).substring(2, 10);
            const filename = `bizyair_${imageType}_${timestamp}_${randomStr}.png`;
            
            // 从base64创建Blob对象
            const byteCharacters = atob(cleanBase64Data);
            const byteArrays = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            
            const blob = new Blob(byteArrays, {type: 'image/png'});
            
            // 创建FormData对象
            const formData = new FormData();
            formData.append('image', blob, filename);
            formData.append('type', imageType);
            formData.append('filename', filename);
            
            // 发送请求
            const headers = {};
            if (token) {
                headers["Authorization"] = token;
            }
            
            const response = await fetch('/upload/image', {
                method: 'POST',
                body: formData,
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`保存图片失败: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('保存图片成功:', data);
            
            // 使用服务器返回的文件名
            const serverFilename = data.name || filename;
            const serverType = data.type || imageType;
            
            // 创建图片对象
            const imageObj = {
                filename: serverFilename,
                type: serverType,
                subfolder: data.subfolder || ''
            };
            
            // 只有LoadImage类型的节点需要更新节点内容
            if (nodeType === 'LoadImage') {
                console.log('处理LoadImage节点，将更新节点内容...');
                // 更新节点的图片数据
                if (!targetNode.images) {
                    targetNode.images = [];
                }
                targetNode.images[0] = imageObj;
                
                if (targetNode.widgets) {
                    // 更新filename widget
                    const imageWidget = targetNode.widgets.find(w => 
                        w.name === 'image' || w.name === 'filename');
                    if (imageWidget) {
                        imageWidget.value = serverFilename;
                        if (typeof imageWidget.callback === "function") {
                            imageWidget.callback(serverFilename);
                        }
                    }
                    
                    // 确保type widget设置为input
                    const typeWidget = targetNode.widgets.find(w => w.name === 'type');
                    if (typeWidget) {
                        typeWidget.value = 'input';
                        if (typeof typeWidget.callback === "function") {
                            typeWidget.callback('input');
                        }
                    }
                }
                
                // 标记重绘但不改变大小
                targetNode.setDirtyCanvas(true, true);
                
                // 恢复原始大小
                if (originalSize) {
                    targetNode.size = originalSize;
                }
                
                // 通知重绘
                app.canvas && app.canvas.draw(true, true);
                
                console.log(`图片已成功应用到LoadImage节点 ${targetNode.title} (ID: ${targetNode.id})`);
            } else {
                // 对于其他类型节点，保存图片
                if (nodeType === 'SaveImage') {
                    console.log(`图片已成功保存到output目录: ${serverFilename}`);
                    alert(`图片已保存到output目录: ${serverFilename}`);
                } else if (nodeType === 'PreviewImage') {
                    console.log(`图片已成功保存到temp目录: ${serverFilename}`);
                    alert(`图片已保存到temp目录: ${serverFilename}`);
                } else {
                    console.log(`图片已成功保存到${imageType}目录: ${serverFilename}`);
                    alert(`图片已保存到${imageType}目录: ${serverFilename}`);
                }
            }
        } catch (error) {
            console.error('应用图片到节点时发生异常:', error);
            alert('处理图片请求失败: ' + error.message);
        }
    }
});

console.log('已设置消息监听器，可接收iframe发送的图片更新请求');

export { app }; 