import { getCookie, getIsServerMode } from "./subassembly/tools.js";
/**
 * 货币类型枚举，包含徽章配置信息
 */
export const CoinType = Object.freeze({
  Free: {
    value: 0,
    icon: "FREE",
    badge: {
      text: "免费",
      bgColor: "#4CAF50", // 绿色
    },
  },
  Gift: {
    value: 1,
    icon: "BZ",
    badge: {
      textPrefix: "赠送银币 ",
      bgColor: "#FF9800", // 橙色
    },
  },
  Charge: {
    value: 2,
    icon: "BZ",
    badge: {
      textPrefix: "付费金币 ",
      bgColor: "#2196F3", // 蓝色
    },
  },
  Mixed: {
    value: 3,
    icon: "BZ",
    badge: {
      textPrefix: "混合币 ",
      bgColor: "#9C27B0", // 紫色
    },
  },
});

/**
 * 检测节点是否包含model输入
 * @param {Object} node - 节点对象
 * @returns {boolean} 如果节点包含model输入则返回true，否则返回false
 */
export function hasModelInput(node) {
  // 优先从节点临时存储中获取（适用于outputs已被删除的情况）
  if (node._bizyairHiddenOutput) {
    return node._bizyairHiddenOutput;
  }

  // 如果临时存储中没有，则从outputs中查找
  const localized_name = "bizyair_model_name";
  if (!node.outputs) {
    return null;
  }
  return node.outputs.find((item) => item.name === localized_name);
}

/**
 * 为节点添加自定义徽章
 * @param {Object} node - 要添加徽章的节点对象
 * @param {Object} badgeOptions - 徽章配置选项
 * @param {string} badgeOptions.text - 徽章显示的文本
 * @param {string} badgeOptions.fgColor - 前景色
 * @param {string} badgeOptions.bgColor - 背景色
 * @param {number} badgeOptions.fontSize - 字体大小
 * @param {number} badgeOptions.padding - 内边距
 * @param {number} badgeOptions.height - 高度
 * @param {number} badgeOptions.cornerRadius - 圆角半径
 * @param {Object} [badgeOptions.iconOptions] - 图标配置选项
 * @param {string} badgeOptions.iconOptions.unicode - 图标的unicode值
 * @param {string} badgeOptions.iconOptions.fontFamily - 图标字体族
 * @param {string} badgeOptions.iconOptions.color - 图标颜色
 * @param {string} badgeOptions.iconOptions.bgColor - 图标背景色
 * @param {number} badgeOptions.iconOptions.fontSize - 图标字体大小
 *
 * @param {number} badgeOptions.iconOptions.uuid - 图标uuid 用于删除 自定义属性
 */
export function addCustomBadge(node, badgeOptions) {
  const customBadge = new LGraphBadge(badgeOptions);
  // 每次添加badge 清空所有badge 因为badge没有一个唯一标识符，并且价格展示也就一个badge 所以直接全部清除
  node.badges = [];
  node.badges.push(() => customBadge);
}

/**
 * 根据货币类型获取徽章配置
 * @param {number} coinType - 货币类型值
 * @param {string} priceText - 价格文本
 * @returns {Object} 徽章配置对象
 */
export function getBadgeConfigByCoinType(coinType, priceText) {
  const baseConfig = {
    fgColor: "white",
    fontSize: 10,
    padding: 6,
    height: 18,
    cornerRadius: 8,
  };

  // 查找对应的货币类型配置
  for (const [key, config] of Object.entries(CoinType)) {
    if (config.value === coinType) {
      const badgeConfig = config.badge;

      // 构建基础徽章配置
      const resultConfig = {
        ...baseConfig,
        bgColor: badgeConfig.bgColor,
        iconOptions: {
          unicode: config.icon,
          fontFamily: "Arial, sans-serif",
          color: "white",
          bgColor: badgeConfig.bgColor,
          fontSize: 12,
        },
      };

      if (key === "Free") {
        return {
          ...resultConfig,
          text: badgeConfig.text,
        };
      } else {
        return {
          ...resultConfig,
          text: `${badgeConfig.textPrefix}${priceText}`,
        };
      }
    }
  }

  // 默认配置（未知类型）
  return {
    ...baseConfig,
    text: priceText,
    bgColor: "#757575", // 灰色
    iconOptions: {
      unicode: "❓",
      fontFamily: "Arial, sans-serif",
      color: "white",
      bgColor: "#757575",
      fontSize: 12,
    },
  };
}

/**
 * 为节点添加价格徽章
 * @param {Object} node - 节点对象，包含 widgets 和其他节点信息
 * @param {string} modelName - 模型名称
 */
export async function addPriceBadgeToNode(node, modelName = "") {
  try {
    // 从节点 widgets 中提取价格计算所需的数据
    const nodeInputs = {};
    if (node.widgets && Array.isArray(node.widgets)) {
      node.widgets.forEach((widget) => {
        if (widget.name && widget.value !== undefined) {
          nodeInputs[widget.name] = widget.value;
        }
      });
    }

    // 如果输入信息中不包含model，需要手动添加model进去
    if (!nodeInputs.model) {
      nodeInputs.model = modelName;
    }

    // 获取价格信息
    const priceResult = await fetchNodePrice(modelName, nodeInputs);

    if (priceResult && priceResult.data && priceResult.data.result) {
      // 根据货币类型获取徽章配置
      const badgeConfig = getBadgeConfigByCoinType(
        priceResult.data.coin_type,
        priceResult.data.result
      );
      
      // 添加价格徽章
      addCustomBadge(node, badgeConfig);
    }
  } catch (error) {
    console.error("添加价格徽章失败:", error);
    
    // 添加错误徽章
    addCustomBadge(node, {
      text: "价格获取失败",
      fgColor: "white",
      bgColor: "#F44336",
      fontSize: 10,
      padding: 6,
      height: 18,
      cornerRadius: 8,
      iconOptions: {
        unicode: "❌",
        fontFamily: "Arial, sans-serif",
        color: "white",
        bgColor: "#F44336",
        fontSize: 12,
      },
    });
  }
}

/**
 * 获取节点价格信息
 * @param {string} model - 模型名称，用于构建请求路径
 * @param {Object} nodeInputs - 节点的所有输入信息，包含价格计算所需的数据
 * @returns {Promise<Object>} 返回价格信息
 * @property {number} code - 响应状态码，20000表示成功
 * @property {string} message - 响应消息
 * @property {boolean} status - 请求状态
 * @property {Object} data - 响应数据
 * @property {string} data.result - 价格描述，如"120/次"
 * @property {number} data.coin_type - 货币类型，0=免费，1=赠与币，2=付费币，3=混合使用
 */
export async function fetchNodePrice(model, nodeInputs) {
  try {
    if (!nodeInputs) {
      throw new Error("节点输入信息为空，无法获取价格");
    }
    const isServerMode = await getIsServerMode();
    let token = null;
    if (isServerMode) {
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
    // 调用bizyengine价格查询接口
    const response = await fetch(
      `/bizyair/trd_api_pricing?model=${encodeURIComponent(model)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(nodeInputs),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("获取节点价格失败:", error);
    throw error;
  }
}
