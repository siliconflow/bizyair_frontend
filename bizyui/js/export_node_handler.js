import { app } from "../../scripts/app.js";

let selectedNodes = [];
let isExportDialogOpen = false;

const originalColors = new Map();

// 刷新时重置节点颜色
function forceInitialColorReset() {
    isExportDialogOpen = false;
    selectedNodes = [];
        setTimeout(() => {
            // 确保所有节点恢复默认颜色
            if (app && app.graph && app.graph._nodes) {
                for (const node of app.graph._nodes) {
                    if (node) {
                        delete node._isExportHighlighted;
                        node.color = null;
                        node.bgcolor = null;
                    }
                }
                app.canvas.setDirty(true, true);
            }
        }, 500);
 
}

// 初始化重置
forceInitialColorReset();

app.registerExtension({
    name: "bizyair.export.node.handler",
    
    async setup() {
        // 默认状态下为非高亮
        disableExportNodeSelection();
        // 监听消息事件
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'EXPORT_DIALOG_STATUS') {
                console.log("收到导出对话框状态变更:", event.data.isOpen);
                // 根据消息更新导出状态
                if (event.data.isOpen) {
                    enableExportNodeSelection();
                } else {
                    disableExportNodeSelection();
                }
            }
        });
        
        // 初始状态检查，防止状态不同步
        setTimeout(() => {
            const exportDialog = document.querySelector('.export-sidebar-wrapper');
            const isDialogVisible = exportDialog && 
                window.getComputedStyle(exportDialog).display !== 'none' && 
                window.getComputedStyle(exportDialog).visibility !== 'hidden';
            
            if (isDialogVisible) {
                enableExportNodeSelection();
            } else {
                disableExportNodeSelection();
            }
        }, 1000);
        
        // 监听页面可见性变化，确保在切换回页面时状态正确
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && isExportDialogOpen) {
                setTimeout(() => {
                    const exportDialog = document.querySelector('.export-sidebar-wrapper');
                    const isDialogVisible = exportDialog && 
                        window.getComputedStyle(exportDialog).display !== 'none' && 
                        window.getComputedStyle(exportDialog).visibility !== 'hidden';
                    
                    // 同步状态
                    if (isDialogVisible && !isExportDialogOpen) {
                        enableExportNodeSelection();
                    } else if (!isDialogVisible && isExportDialogOpen) {
                        disableExportNodeSelection();
                    }
                }, 200);
            }
        });
        
        // 在画布实例化完成后重新检查
        if (app.canvas) {
            app.canvas.onDrawBackground = function() {
                // 初次渲染后确认状态
                if (!this._exportStateConfirmed) {
                    this._exportStateConfirmed = true;
                    // 确保默认状态是正确的
                    if (!isExportDialogOpen) {
                        forceInitialColorReset();
                    }
                }
                
                // 调用原始的背景绘制方法
                if (this._original_drawBackground) {
                    this._original_drawBackground.call(this);
                }
            };
        }
        
        // 监听节点添加事件，在导出模式下自动标记新节点
        if (app.graph) {
            const originalAddNodeMethod = app.graph.add;
            app.graph.add = function(node) {
                const result = originalAddNodeMethod.call(this, node);
                
                // 如果当前处于导出模式，立即标记新节点
                if (isExportDialogOpen && node && node.widgets && node.widgets.length > 0) {
                    markNodeAsClickable(node);
                }
                
                return result;
            };
        }
    },
    
    async nodeCreated(node) {
        // 确保新创建的节点默认不高亮
        if (!isExportDialogOpen) {
            node.color = null;
            node.bgcolor = null;
        } else if (node.widgets && node.widgets.length > 0) {
            // 如果当前处于导出模式且节点有widgets，立即标记
            markNodeAsClickable(node);
        }
        
        // 保存原始的onMouseDown方法
        if (!node._originalExportOnMouseDown) {
            node._originalExportOnMouseDown = node.onMouseDown;
        }
        
        // 增强节点的onMouseDown方法来处理导出点击
        node.onMouseDown = function(e, pos, canvas) {
            // 如果导出对话框打开且是左键点击
            if (isExportDialogOpen && e.button === 0) {
                // 确保节点有widgets
                if (this.widgets && this.widgets.length > 0) {
                    console.log("导出模式: 点击节点", this.title);
                    
                    try {
                        // 阻止事件传播防止拖拽等操作
                        e.stopPropagation();
                        e.preventDefault();
                        
                        // 切换节点选择状态
                        toggleNodeSelection(this);
                        
                        return false;
                    } catch (error) {
                        console.error("处理节点点击事件时出错:", error);
                        return this._originalExportOnMouseDown?.apply(this, arguments);
                    }
                }
            }
            
            // 否则使用原始处理方法
            return this._originalExportOnMouseDown?.apply(this, arguments);
        };
    }
});

// 更新节点参数值
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'UPDATE_NODE_WIDGET') {
        
            const { nodeId, widgetName, newValue } = event.data;
            
            // 查找对应节点
            const node = app.graph._nodes.find(n => n.id === nodeId);
            if (node && node.widgets) {
                const widget = node.widgets.find(w => w.name === widgetName);
                if (widget) {
                    console.log(`更新节点 ${node.title} 的参数 ${widgetName} 值为:`, newValue);
                    widget.value = newValue;
                    
                    // 更新内部状态中的节点信息
                    const nodeIndex = selectedNodes.findIndex(n => n.id === nodeId);
                    if (nodeIndex !== -1) {
                        const widgetIndex = selectedNodes[nodeIndex].widgets.findIndex(w => w.name === widgetName);
                        if (widgetIndex !== -1) {
                            selectedNodes[nodeIndex].widgets[widgetIndex].value = newValue;
                        }
                    }
                    
                    // 通知画布更新
                    node.setDirtyCanvas(true, true);
                }
            }
    } else if (event.data && event.data.type === 'RESET_NODE_HIGHLIGHT') {
     
            const { nodeId } = event.data;
            
            // 查找对应节点
            const node = app.graph._nodes.find(n => n.id === nodeId);
            if (node) {
                console.log(`重置节点高亮状态: ${node.title}`);
                
                // 从选中列表中移除
                const nodeIndex = selectedNodes.findIndex(n => n.id === nodeId);
                if (nodeIndex !== -1) {
                    selectedNodes.splice(nodeIndex, 1);
                }
                
                // 恢复为可点击状态的颜色（紫色）
                node.color = "#7C3AED";
                node.bgcolor = "#7C3AED22";
                node._isExportHighlighted = true;
                
                // 强制画布重绘以更新显示
                app.canvas.setDirty(true, true);
                
                // 不需要再次发送节点信息，因为已经在Vue组件中移除了
            }
      
    }
});

// 切换节点选择状态
function toggleNodeSelection(node) {

        const nodeIndex = selectedNodes.findIndex(n => n.id === node.id);
        
        if (nodeIndex === -1) {
            // 收集节点信息，确保所有属性可序列化
            const nodeInfo = createSerializableNodeInfo(node);
            
            // 添加到选中列表
            selectedNodes.push(nodeInfo);
            
            console.log(`选中节点: ${node.title}`);
            
            // 设置节点为选中状态的颜色（橙色）
            node.color = "#FF7F50";
            node.bgcolor = "#FF7F5033";
            node._isExportHighlighted = true;
            
            // 强制画布重绘以更新显示
            app.canvas.setDirty(true, true);
            
            // 发送最新的选中节点信息
            sendNodesToExportDialog();
        } else {
            // 节点已经选中，不做任何操作
            // 移除了再次点击取消选择的逻辑
            console.log(`节点已选中: ${node.title}`);
        }
  
}

// 创建可序列化的节点信息对象
function createSerializableNodeInfo(node) {
        // 基本节点信息
        const nodeInfo = {
            id: node.id,
            type: node.type,
            comfyClass: node.comfyClass,
            title: node.title,
            widgets: []
        };
        
        // 处理widgets
        if (node.widgets && node.widgets.length > 0) {
            nodeInfo.widgets = node.widgets.map(widget => {
                // 创建基本widget对象
                const widgetInfo = {
                    name: String(widget.name || ""),
                    value: widget.value != null ? widget.value : "",
                    type: String(widget.type || "")
                };
                
                // 安全地处理options属性
                if (widget.options) {
                    widgetInfo.options = {};
                    
                    // 处理options.values数组（如果存在）
                    if (widget.options.values) {
                        if (typeof widget.options.values === 'function') {
                            // 如果是函数，忽略或尝试获取结果
                            try {
                                const values = widget.options.values();
                                if (Array.isArray(values)) {
                                    widgetInfo.options.values = [...values];
                                }
                            } catch (e) {
                                console.warn(`无法获取widget ${widget.name}的values函数结果:`, e);
                                widgetInfo.options.values = [];
                            }
                        } else if (Array.isArray(widget.options.values)) {
                            // 如果是数组，直接复制
                            widgetInfo.options.values = [...widget.options.values];
                        }
                    }
                }
                
                return widgetInfo;
            });
        }
        
        return nodeInfo;
 
}

// 发送选中的节点信息到导出对话框
function sendNodesToExportDialog() {
    try {
        console.log("发送选中节点信息到导出对话框", selectedNodes);

        const nodesToSend = JSON.parse(JSON.stringify(selectedNodes));
        
        // 使用postMessage发送到Vue组件
        window.parent.postMessage({
            type: 'EXPORT_SELECTED_NODES',
            nodes: nodesToSend
        }, '*');
        
        // 同时使用全局对象方法
        if (window.bizyAirLib && typeof window.bizyAirLib.updateExportNodes === 'function') {
            window.bizyAirLib.updateExportNodes(nodesToSend);
        }
    } catch (error) {
        console.error("发送节点信息到导出对话框时出错:", error);
    }
}

// 标记单个节点为可点击
function markNodeAsClickable(node) {
    if (!node || !node.widgets || node.widgets.length === 0) {
        return;
    }
    
        // 保存原始颜色
        if (!originalColors.has(node.id)) {
            originalColors.set(node.id, {
                color: node.color,
                bgcolor: node.bgcolor
            });
        }
        
        // 标记节点已经被高亮处理
        node._isExportHighlighted = true;
        
        // 检查是否已经在选中列表中
        if (selectedNodes.some(n => n.id === node.id)) {
            // 选中状态颜色
            node.color = "#FF7F50";
            node.bgcolor = "#FF7F5033";
        } else {
            // 可点击状态颜色
            node.color = "#7C3AED";
            node.bgcolor = "#7C3AED22";
        }
        
        // 标记脏画布，但不立即强制更新
        if (node.graph && node.graph.canvas) {
            node.graph.canvas.dirty_canvas = true;
        }
}

// 标记所有有widgets的节点为可点击
function markClickableNodes() {
        for (const node of app.graph._nodes) {
            markNodeAsClickable(node);
        }
        //重绘
        app.canvas.setDirty(true, true);

}
// 恢复节点颜色
function restoreAllNodeColors() {
        console.log("恢复所有节点颜色");
        // 遍历节点恢复颜色
        for (const node of app.graph._nodes) {
            if (node) {
                delete node._isExportHighlighted;
                const original = originalColors.get(node.id);
                if (original) {
                    node.color = original.color;
                    node.bgcolor = original.bgcolor;
                } else {
                    node.color = null;
                    node.bgcolor = null;
                }
            }
        }
        originalColors.clear();
        app.canvas.setDirty(true, true);
}

// 启用导出节点选择
function enableExportNodeSelection() {
    if (isExportDialogOpen) {
        console.log("导出节点选择模式已经启用");
        return;
    }
    
    console.log("启用导出节点选择模式");
    isExportDialogOpen = true;
    selectedNodes = [];
    //标记可点击的节点
    markClickableNodes();

}

// 禁用导出节点选择
function disableExportNodeSelection() {
    isExportDialogOpen = false;
    selectedNodes = [];

    restoreAllNodeColors();

}

