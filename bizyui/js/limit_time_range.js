import { app } from "../../../scripts/app.js";
/*
  hailuo节点添加1080p禁止10s功能
*/
// 简单的链式callback实现（类似useChainCallback）
function chainCallback(originalCallback, newCallback) {
  return function (...args) {
    if (originalCallback) {
      originalCallback.apply(this, args);
    }
    newCallback.apply(this, args);
  };
}

app.registerExtension({
  name: "bizyair.hailuo.limitTimeRange",
  nodeCreated(node, app) {
    console.log(node.title);
    // 只处理 BizyAir_Hailuo2_3_T2V 节点
    if (
      node.title !== "☁️BizyAir Hailuo2.3 Image To Video" &&
      node.title !== "☁️BizyAir Hailuo2.3 Text To Video"
    ) {
      return;
    }
    console.log(node.title , `开始处理`);
    // 延迟执行，确保 widget 完全初始化
    setTimeout(() => {
      try {
        const resolutionWidget = node.widgets?.find(
          (w) => w.name === "resolution"
        );
        const durationWidget = node.widgets?.find((w) => w.name === "duration");

        if (!resolutionWidget || !durationWidget) {
          console.warn("[Hailuo2_3_T2V] 未找到 resolution 或 duration widget");
          return;
        }

        // 保存 duration widget 的原始选项值
        const originalDurationValues = durationWidget.options?.values
          ? Array.isArray(durationWidget.options.values)
            ? [...durationWidget.options.values]
            : typeof durationWidget.options.values === "function"
            ? durationWidget.options.values()
            : []
          : [];

        // 如果没有原始值，无法继续
        if (!originalDurationValues || originalDurationValues.length === 0) {
          console.warn("[Hailuo2_3_T2V] duration widget 没有可用的选项值");
          return;
        }

        // 更新 duration 选项的函数
        const updateDurationOptions = () => {
          const resolutionValue = resolutionWidget.value;
          // 支持 "1080p"、"1080P" 等大小写变体
          const is1080p =
            resolutionValue === "1080p" ||
            resolutionValue === "1080P" ||
            String(resolutionValue).toUpperCase() === "1080P";

          // 直接修改 widget.options.values 数组
          if (!durationWidget.options) {
            durationWidget.options = {};
          }

          if (is1080p) {
            // 如果是 1080p，从 values 数组中删除 10
            if (Array.isArray(durationWidget.options.values)) {
              // 找到 10 的索引并删除
              const index = durationWidget.options.values.indexOf(10);
              if (index !== -1) {
                durationWidget.options.values.splice(index, 1);
              }
            } else {
              // 如果不是数组，重新创建数组并过滤掉 10
              durationWidget.options.values = originalDurationValues.filter(
                (val) => val !== 10
              );
            }
          } else {
            // 如果不是 1080p，恢复原始值（包括 10）
            durationWidget.options.values = [...originalDurationValues];
          }

          // 检查当前值是否在新的 values 中，如果不在则调整为第一个可用值
          const currentValue = durationWidget.value;
          const valuesArray = Array.isArray(durationWidget.options.values)
            ? durationWidget.options.values
            : [];

          if (valuesArray.length > 0 && !valuesArray.includes(currentValue)) {
            const newValue = valuesArray[0];
            durationWidget.value = newValue;
            // 触发 callback
            if (durationWidget.callback) {
              durationWidget.callback.call(durationWidget, newValue);
            }
          }

          // 触发节点和画布更新，确保 UI 刷新
          if (node.setDirtyCanvas) {
            node.setDirtyCanvas(true, true);
          }
          if (node.graph && node.graph.setDirtyCanvas) {
            node.graph.setDirtyCanvas(true, true);
          }
        };

        // 保存原始的 resolution callback
        const originalResolutionCallback = resolutionWidget.callback;

        // 使用 chainCallback 包装 resolution callback，监听变化
        resolutionWidget.callback = chainCallback(
          originalResolutionCallback,
          function (value) {
            // 更新 duration 选项
            updateDurationOptions();
          }
        );

        // 初始化时执行一次，确保选项正确
        updateDurationOptions();
      } catch (error) {
        console.error("[Hailuo2_3_T2V] 初始化时间范围限制失败:", error);
      }
    }, 200);
  },
});
