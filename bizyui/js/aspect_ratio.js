import { app } from "../../scripts/app.js";

/*
  BizyAir_Seedream4_5
  添加宽高比和总像素限制
*/

// Seedream 4.5 节点的宽高比和总像素限制
const MIN_ASPECT_RATIO = 1 / 16; // 1/16
const MAX_ASPECT_RATIO = 16; // 16
const MIN_TOTAL_PIXELS = 2560 * 1440; // 3686400
const MAX_TOTAL_PIXELS = 4096 * 4096; // 16777216

/**
 * 验证所有约束是否满足
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @returns {boolean} 是否满足所有约束
 */
function satisfiesAllConstraints(width, height) {
  const totalPixels = width * height;
  const aspectRatio = width / height;

  return (
    totalPixels >= MIN_TOTAL_PIXELS &&
    totalPixels <= MAX_TOTAL_PIXELS &&
    aspectRatio >= MIN_ASPECT_RATIO &&
    aspectRatio <= MAX_ASPECT_RATIO &&
    width >= 480 &&
    width <= 4096 &&
    height >= 480 &&
    height <= 4096
  );
}

/**
 * 计算给定宽度时，高度的合法范围
 * @param {number} width - 宽度
 * @returns {{min: number, max: number}} 高度的最小值和最大值
 */
function calculateHeightRange(width) {
  // 来自总像素的限制
  const minHeightByPixel = MIN_TOTAL_PIXELS / width;
  const maxHeightByPixel = MAX_TOTAL_PIXELS / width;

  // 来自宽高比的限制
  // width/height <= 16 => height >= width/16
  // width/height >= 1/16 => height <= width*16
  const minHeightByRatio = width / MAX_ASPECT_RATIO;
  const maxHeightByRatio = width * MAX_ASPECT_RATIO;

  // 取交集：下限取最大值（最严格），上限取最小值（最严格）
  const minHeight = Math.max(
    Math.max(minHeightByPixel, minHeightByRatio),
    480 // 单边最小值
  );
  const maxHeight = Math.min(
    Math.min(maxHeightByPixel, maxHeightByRatio),
    4096 // 单边最大值
  );

  return { min: minHeight, max: maxHeight };
}

/**
 * 计算给定高度时，宽度的合法范围
 * @param {number} height - 高度
 * @returns {{min: number, max: number}} 宽度的最小值和最大值
 */
function calculateWidthRange(height) {
  // 来自总像素的限制
  const minWidthByPixel = MIN_TOTAL_PIXELS / height;
  const maxWidthByPixel = MAX_TOTAL_PIXELS / height;

  // 来自宽高比的限制
  // width/height >= 1/16 => width >= height/16
  // width/height <= 16 => width <= height*16
  const minWidthByRatio = height * MIN_ASPECT_RATIO;
  const maxWidthByRatio = height * MAX_ASPECT_RATIO;

  // 取交集
  const minWidth = Math.max(Math.max(minWidthByPixel, minWidthByRatio), 480);
  const maxWidth = Math.min(Math.min(maxWidthByPixel, maxWidthByRatio), 4096);

  return { min: minWidth, max: maxWidth };
}

/**
 * 根据改变的维度和当前另一个维度，计算满足所有约束的新尺寸
 * 使用橡皮筋算法（Clamp Algorithm）：尽量保持原宽高比，超出范围则截断
 * @param {number} changedValue - 改变的维度值（宽或高）
 * @param {number} otherValue - 另一个维度的当前值
 * @param {boolean} isWidthChanged - 是否是宽度改变
 * @param {number} oldValue - 改变前的维度值（用于计算宽高比），如果未提供则使用 otherValue 作为参考
 * @returns {{width: number, height: number}} 计算后的宽高值
 */
function calculateNewDimensions(
  changedValue,
  otherValue,
  isWidthChanged,
  oldValue = null
) {
  // 如果另一个值为0或无效，使用默认值
  if (!otherValue || otherValue === 0) {
    otherValue = changedValue;
  }

  // 第一步：先限制改变的维度本身在合法范围内
  let newWidth, newHeight;
  if (isWidthChanged) {
    // 宽度改变，先限制宽度在合法范围内
    newWidth = Math.max(480, Math.min(4096, changedValue));

    // 计算高度的合法范围
    const heightRange = calculateHeightRange(newWidth);

    // 如果合法范围无效（下限大于上限），说明宽度本身不合法，需要调整宽度
    if (heightRange.min > heightRange.max) {
      // 宽度太极端，无法找到匹配的高度
      // 尝试调整宽度到合理范围
      // 计算宽度的合法范围（基于一个合理的高度值，比如2048）
      const tempHeight = 2048;
      const widthRange = calculateWidthRange(tempHeight);
      newWidth = Math.max(widthRange.min, Math.min(widthRange.max, newWidth));

      // 重新计算高度范围
      const newHeightRange = calculateHeightRange(newWidth);
      if (newHeightRange.min > newHeightRange.max) {
        // 仍然无效，使用默认值
        newWidth = 2048;
        newHeight = 2048;
        return { width: Math.round(newWidth), height: Math.round(newHeight) };
      }
    }

    // 第二步：计算理想高度（保持原宽高比）
    // 如果提供了旧宽度，使用旧宽高比：idealHeight = newWidth * (oldHeight / oldWidth)
    // 如果没有提供旧宽度，假设用户希望保持 newWidth/otherValue 的比例（即高度不变）
    let idealHeight;
    if (oldValue !== null && oldValue > 0 && otherValue > 0) {
      // 使用旧宽高比计算理想高度
      const oldRatio = oldValue / otherValue;
      idealHeight = newWidth / oldRatio;
    } else {
      // 没有旧值，假设保持当前高度（即比例 = newWidth / otherValue）
      idealHeight = otherValue;
    }

    // 第三步：将理想高度"截断"到合法范围（橡皮筋逻辑）
    newHeight = Math.max(
      heightRange.min,
      Math.min(heightRange.max, idealHeight)
    );
    newHeight = Math.round(newHeight);

    // 第四步：如果高度被截断，可能需要微调宽度以更好地满足约束
    // 但为了保持"尽量不动a"的原则，这里只做轻微调整
    // 重新计算宽度范围（基于调整后的高度）
    const finalWidthRange = calculateWidthRange(newHeight);
    newWidth = Math.max(
      finalWidthRange.min,
      Math.min(finalWidthRange.max, newWidth)
    );
    newWidth = Math.round(newWidth);
  } else {
    // 高度改变，先限制高度在合法范围内
    newHeight = Math.max(480, Math.min(4096, changedValue));

    // 计算宽度的合法范围
    const widthRange = calculateWidthRange(newHeight);

    // 如果合法范围无效，需要调整高度
    if (widthRange.min > widthRange.max) {
      const tempWidth = 2048;
      const heightRange = calculateHeightRange(tempWidth);
      newHeight = Math.max(
        heightRange.min,
        Math.min(heightRange.max, newHeight)
      );

      const newWidthRange = calculateWidthRange(newHeight);
      if (newWidthRange.min > newWidthRange.max) {
        newWidth = 2048;
        newHeight = 2048;
        return { width: Math.round(newWidth), height: Math.round(newHeight) };
      }
    }

    // 计算理想宽度（保持原宽高比）
    // 如果提供了旧高度，使用旧宽高比：idealWidth = newHeight * (oldWidth / oldHeight)
    // 如果没有提供旧高度，假设用户希望保持 otherValue/newHeight 的比例（即宽度不变）
    let idealWidth;
    if (oldValue !== null && oldValue > 0 && otherValue > 0) {
      // 使用旧宽高比计算理想宽度
      const oldRatio = otherValue / oldValue;
      idealWidth = newHeight * oldRatio;
    } else {
      // 没有旧值，假设保持当前宽度（即比例 = otherValue / newHeight）
      idealWidth = otherValue;
    }

    // 将理想宽度截断到合法范围
    newWidth = Math.max(widthRange.min, Math.min(widthRange.max, idealWidth));
    newWidth = Math.round(newWidth);

    // 微调高度
    const finalHeightRange = calculateHeightRange(newWidth);
    newHeight = Math.max(
      finalHeightRange.min,
      Math.min(finalHeightRange.max, newHeight)
    );
    newHeight = Math.round(newHeight);
  }

  // 最终确保在合理范围内（双重保险）
  newWidth = Math.max(480, Math.min(4096, newWidth));
  newHeight = Math.max(480, Math.min(4096, newHeight));

  return { width: newWidth, height: newHeight };
}

/**
 * 验证并调整宽高值，确保满足所有约束（用于size切换到Custom时的验证）
 * 使用橡皮筋算法：尽量保持原宽高比，超出范围则截断
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @returns {{width: number, height: number}} 调整后的宽高
 */
function validateAndAdjustDimensions(width, height) {
  // 如果已经满足所有约束，直接返回
  if (satisfiesAllConstraints(width, height)) {
    return { width: Math.round(width), height: Math.round(height) };
  }

  // 保存原始宽高比（尽量保持）
  const originalRatio = width / height;

  // 第一步：限制单边尺寸范围（480-4096）
  width = Math.max(480, Math.min(4096, width));
  height = Math.max(480, Math.min(4096, height));

  // 第二步：调整宽高比到合法范围（如果超出）
  let aspectRatio = width / height;
  if (aspectRatio < MIN_ASPECT_RATIO) {
    // 宽高比太小，调整宽度
    width = Math.round(height * MIN_ASPECT_RATIO);
    width = Math.max(480, Math.min(4096, width));
  } else if (aspectRatio > MAX_ASPECT_RATIO) {
    // 宽高比太大，调整宽度
    width = Math.round(height * MAX_ASPECT_RATIO);
    width = Math.max(480, Math.min(4096, width));
  }

  // 第三步：调整总像素到合法范围（保持当前宽高比）
  let totalPixels = width * height;
  if (totalPixels < MIN_TOTAL_PIXELS) {
    // 总像素太小，按比例放大
    const scale = Math.sqrt(MIN_TOTAL_PIXELS / totalPixels);
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);

    // 检查放大后是否超出单边限制
    if (newWidth <= 4096 && newHeight <= 4096) {
      width = newWidth;
      height = newHeight;
    } else {
      // 超出限制，调整到最大可能的尺寸（保持宽高比）
      aspectRatio = width / height;
      if (aspectRatio >= MIN_ASPECT_RATIO && aspectRatio <= MAX_ASPECT_RATIO) {
        if (width > height) {
          width = 4096;
          height = Math.round(4096 / aspectRatio);
          height = Math.max(480, Math.min(4096, height));
        } else {
          height = 4096;
          width = Math.round(4096 * aspectRatio);
          width = Math.max(480, Math.min(4096, width));
        }
      }
    }
  } else if (totalPixels > MAX_TOTAL_PIXELS) {
    // 总像素太大，按比例缩小
    const scale = Math.sqrt(MAX_TOTAL_PIXELS / totalPixels);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // 第四步：最终验证和微调（最多一次回退检查）
  // 重新计算当前值
  width = Math.max(480, Math.min(4096, width));
  height = Math.max(480, Math.min(4096, height));
  aspectRatio = width / height;
  totalPixels = width * height;

  // 如果宽高比仍然不合法，强制调整
  if (aspectRatio < MIN_ASPECT_RATIO) {
    width = Math.round(height * MIN_ASPECT_RATIO);
    if (width > 4096) {
      width = 4096;
      height = Math.round(4096 / MIN_ASPECT_RATIO);
      if (height > 4096) {
        height = 4096;
        width = Math.round(4096 * MIN_ASPECT_RATIO);
      }
    }
    totalPixels = width * height;
    if (totalPixels > MAX_TOTAL_PIXELS) {
      const scale = Math.sqrt(MAX_TOTAL_PIXELS / totalPixels);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
  } else if (aspectRatio > MAX_ASPECT_RATIO) {
    width = Math.round(height * MAX_ASPECT_RATIO);
    if (width > 4096) {
      width = 4096;
      height = Math.round(4096 / MAX_ASPECT_RATIO);
      if (height > 4096) {
        height = 4096;
        width = Math.round(4096 * MAX_ASPECT_RATIO);
      }
    }
    totalPixels = width * height;
    if (totalPixels > MAX_TOTAL_PIXELS) {
      const scale = Math.sqrt(MAX_TOTAL_PIXELS / totalPixels);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
  }

  // 最终确保在合理范围内
  width = Math.max(480, Math.min(4096, width));
  height = Math.max(480, Math.min(4096, height));

  return { width: Math.round(width), height: Math.round(height) };
}

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
  name: "bizyair.seedream45.aspectRatio",
  nodeCreated(node, app) {
    // 只处理 Seedream 4.5 节点
    if (node.title !== "☁️BizyAir Seedream 4.5") {
      return;
    }

    // 延迟执行，确保widget完全初始化，并且ComfyUI的setupNodeWidgetCallbacks已经执行
    setTimeout(() => {
      try {
        // 查找 width、height 和 size widget
        const widthWidget = node.widgets?.find(
          (w) => w.name === "custom_width"
        );
        const heightWidget = node.widgets?.find(
          (w) => w.name === "custom_height"
        );
        const sizeWidget = node.widgets?.find((w) => w.name === "size");

        if (!widthWidget || !heightWidget) {
          console.warn(
            "[Seedream4.5] 未找到 custom_width 或 custom_height widget"
          );
          return;
        }

        console.log("[Seedream4.5] 节点创建，开始设置宽高比联动", {
          nodeId: node.id,
          nodeType: node.type,
          sizeWidget: sizeWidget,
          sizeValue: sizeWidget?.value,
          sizeType: sizeWidget?.type,
          sizeOptions: sizeWidget?.options,
          sizeOptionsValues: sizeWidget?.options?.values,
          widthValue: widthWidget.value,
          heightValue: heightWidget.value,
          widthCallback: widthWidget.callback,
          heightCallback: heightWidget.callback,
        });

        // 标记是否正在更新，避免循环触发
        let isUpdating = false;

        // 保存当前的 callback（可能已经被ComfyUI包装过）
        const currentWidthCallback = widthWidget.callback;
        const currentHeightCallback = heightWidget.callback;

        // 检查 size 是否为 "Custom"，只有 Custom 模式才需要联动
        // 实时获取size widget的值，而不是在闭包中捕获
        const isCustomSize = () => {
          if (!sizeWidget) {
            console.log("[Seedream4.5] sizeWidget不存在");
            return false;
          }
          const sizeValue = sizeWidget.value;

          // 获取size widget的所有选项值
          const sizeOptions = sizeWidget.options?.values || [];
          const hasCustomOption = sizeOptions.some((opt) => {
            const optValue = typeof opt === "string" ? opt : opt?.value || opt;
            return (
              optValue === "Custom" ||
              optValue === "custom" ||
              optValue === "CUSTOM"
            );
          });

          // 打印sizeOptions的详细信息
          const sizeOptionsDetails = sizeOptions.map((opt, idx) => {
            const optValue = typeof opt === "string" ? opt : opt?.value || opt;
            const optLabel =
              typeof opt === "string" ? opt : opt?.label || opt?.value || opt;
            return { index: idx, value: optValue, label: optLabel, raw: opt };
          });

          // 查找Custom选项的实际值
          let customOptionValue = null;
          sizeOptions.forEach((opt) => {
            const optValue = typeof opt === "string" ? opt : opt?.value || opt;
            const optLabel =
              typeof opt === "string" ? opt : opt?.label || opt?.value || opt;
            if (
              optValue === "Custom" ||
              optValue === "custom" ||
              optValue === "CUSTOM" ||
              optLabel === "Custom" ||
              optLabel === "custom" ||
              optLabel === "CUSTOM" ||
              String(optValue).toLowerCase().includes("custom") ||
              String(optLabel).toLowerCase().includes("custom")
            ) {
              customOptionValue = optValue;
            }
          });

          console.log("[Seedream4.5] 检查isCustomSize", {
            sizeValue,
            type: typeof sizeValue,
            sizeOptions: sizeOptions,
            sizeOptionsDetails: sizeOptionsDetails,
            customOptionValue: customOptionValue,
            hasCustomOption,
            equalsCustom:
              sizeValue === "Custom" ||
              sizeValue === "custom" ||
              sizeValue === "CUSTOM" ||
              sizeValue === customOptionValue,
            sizeWidget: sizeWidget,
          });

          // 检查多种可能的"Custom"值
          // 如果size widget有Custom选项，检查当前值是否等于Custom（包括找到的实际值）
          if (hasCustomOption) {
            const isCustom =
              sizeValue === "Custom" ||
              sizeValue === "custom" ||
              sizeValue === "CUSTOM" ||
              (customOptionValue && sizeValue === customOptionValue);

            console.log("[Seedream4.5] Custom检查结果", {
              sizeValue,
              customOptionValue,
              isCustom,
              checks: {
                equalsCustom: sizeValue === "Custom",
                equalsLowercase: sizeValue === "custom",
                equalsUppercase: sizeValue === "CUSTOM",
                equalsFoundValue:
                  customOptionValue && sizeValue === customOptionValue,
              },
            });

            return isCustom;
          }

          // 如果没有Custom选项，但当前值不在预设选项中，也认为是Custom模式
          // 这适用于动态选项的情况
          const isPresetValue = sizeOptions.some((opt) => {
            const optValue = typeof opt === "string" ? opt : opt?.value || opt;
            return optValue === sizeValue;
          });

          return !isPresetValue;
        };

        // 处理宽度变化的函数
        const handleWidthChange = (newValue) => {
          const customSize = isCustomSize();
          console.log("[Seedream4.5] handleWidthChange 被调用", {
            newValue,
            isCustomSize: customSize,
            isUpdating,
            sizeWidgetValue: sizeWidget?.value,
            sizeWidgetExists: !!sizeWidget,
          });

          if (!customSize || isUpdating) {
            console.log("[Seedream4.5] 跳过处理", {
              reason: !customSize ? "size不是Custom" : "正在更新中",
            });
            return;
          }

          isUpdating = true;
          try {
            const numValue = Number(newValue);
            if (isNaN(numValue)) {
              return;
            }

            const currentHeight = Number(heightWidget.value) || 2048;
            // 获取旧宽度：在回调触发时，widthWidget.value 可能还是旧值（ComfyUI通常在callback中先调用callback再更新value）
            // 但如果已经更新了，我们使用传入的 value 作为新值，尝试从 widget.value 获取旧值
            // 如果 widget.value 等于新值，说明已经更新了，我们无法获取真正的旧值，使用新值作为参考
            let oldWidth = Number(widthWidget.value) || 2048;
            if (Math.abs(oldWidth - numValue) < 0.5) {
              // widget.value 已经等于新值，说明值已经更新
              // 在这种情况下，我们无法获取真正的旧值，使用新值作为参考（会假设保持当前比例）
              oldWidth = numValue;
            }
            // 使用新的计算函数，同时考虑总像素和宽高比约束
            // 传入旧宽度以正确计算宽高比
            const adjusted = calculateNewDimensions(
              numValue,
              currentHeight,
              true,
              oldWidth
            );

            console.log("[Seedream4.5] 计算完成", {
              width: numValue,
              currentHeight,
              adjustedHeight: adjusted.height,
              adjusted,
              heightDiff: Math.abs(adjusted.height - currentHeight),
              widthDiff: Math.abs(adjusted.width - numValue),
              willUpdateHeight: Math.abs(adjusted.height - currentHeight) > 0.5,
              willUpdateWidth: Math.abs(adjusted.width - numValue) > 0.5,
            });

            if (Math.abs(adjusted.height - currentHeight) > 0.5) {
              console.log("[Seedream4.5] 更新高度", {
                from: currentHeight,
                to: adjusted.height,
                beforeUpdate: heightWidget.value,
              });
              // 直接设置值并调用callback
              heightWidget.value = adjusted.height;
              console.log("[Seedream4.5] 高度值已更新", {
                afterUpdate: heightWidget.value,
              });
              if (currentHeightCallback) {
                currentHeightCallback.call(heightWidget, adjusted.height);
                console.log("[Seedream4.5] 高度callback已调用");
              }
            } else {
              console.log("[Seedream4.5] 跳过高度更新", {
                reason: "高度差值太小",
                currentHeight,
                adjustedHeight: adjusted.height,
                diff: Math.abs(adjusted.height - currentHeight),
              });
            }

            if (Math.abs(adjusted.width - numValue) > 0.5) {
              console.log("[Seedream4.5] 更新宽度", {
                from: numValue,
                to: adjusted.width,
                beforeUpdate: widthWidget.value,
              });
              widthWidget.value = adjusted.width;
              console.log("[Seedream4.5] 宽度值已更新", {
                afterUpdate: widthWidget.value,
              });
              if (currentWidthCallback) {
                currentWidthCallback.call(widthWidget, adjusted.width);
                console.log("[Seedream4.5] 宽度callback已调用");
              }
            } else {
              console.log("[Seedream4.5] 跳过宽度更新", {
                reason: "宽度差值太小",
                numValue,
                adjustedWidth: adjusted.width,
                diff: Math.abs(adjusted.width - numValue),
              });
            }

            if (node && node.setDirtyCanvas) {
              node.setDirtyCanvas(true, true);
            }
          } catch (error) {
            console.error("[Seedream4.5] 更新宽度时出错:", error);
          } finally {
            isUpdating = false;
          }
        };

        // 处理高度变化的函数
        const handleHeightChange = (newValue) => {
          const customSize = isCustomSize();
          console.log("[Seedream4.5] handleHeightChange 被调用", {
            newValue,
            isCustomSize: customSize,
            isUpdating,
            sizeWidgetValue: sizeWidget?.value,
            sizeWidgetExists: !!sizeWidget,
          });

          if (!customSize || isUpdating) {
            console.log("[Seedream4.5] 跳过处理", {
              reason: !customSize ? "size不是Custom" : "正在更新中",
            });
            return;
          }

          isUpdating = true;
          try {
            const numValue = Number(newValue);
            if (isNaN(numValue)) {
              return;
            }

            const currentWidth = Number(widthWidget.value) || 2048;
            // 获取旧高度：类似宽度的处理
            let oldHeight = Number(heightWidget.value) || 2048;
            if (Math.abs(oldHeight - numValue) < 0.5) {
              // widget.value 已经等于新值，说明值已经更新
              // 使用新值作为参考（会假设保持当前比例）
              oldHeight = numValue;
            }
            // 使用新的计算函数，同时考虑总像素和宽高比约束
            // 传入旧高度以正确计算宽高比
            const adjusted = calculateNewDimensions(
              numValue,
              currentWidth,
              false,
              oldHeight
            );

            console.log("[Seedream4.5] 计算完成", {
              height: numValue,
              currentWidth,
              adjustedWidth: adjusted.width,
              adjusted,
            });

            if (Math.abs(adjusted.width - currentWidth) > 0.5) {
              console.log("[Seedream4.5] 更新宽度", {
                from: currentWidth,
                to: adjusted.width,
              });
              widthWidget.value = adjusted.width;
              if (currentWidthCallback) {
                currentWidthCallback.call(widthWidget, adjusted.width);
              }
            }

            if (Math.abs(adjusted.height - numValue) > 0.5) {
              console.log("[Seedream4.5] 更新高度", {
                from: numValue,
                to: adjusted.height,
              });
              heightWidget.value = adjusted.height;
              if (currentHeightCallback) {
                currentHeightCallback.call(heightWidget, adjusted.height);
              }
            }

            if (node && node.setDirtyCanvas) {
              node.setDirtyCanvas(true, true);
            }
          } catch (error) {
            console.error("[Seedream4.5] 更新高度时出错:", error);
          } finally {
            isUpdating = false;
          }
        };

        // 使用链式callback包装width widget的callback
        widthWidget.callback = chainCallback(
          currentWidthCallback,
          function (value) {
            console.log("[Seedream4.5] width callback 被调用", {
              value,
              widgetValue: widthWidget.value,
            });
            // 在回调中，value 是新值，widthWidget.value 可能还是旧值（取决于ComfyUI的实现）
            // 为了安全，我们使用 value 作为新值，widthWidget.value 作为旧值的参考
            handleWidthChange(value);
          }
        );

        // 使用链式callback包装height widget的callback
        heightWidget.callback = chainCallback(
          currentHeightCallback,
          function (value) {
            console.log("[Seedream4.5] height callback 被调用", {
              value,
              widgetValue: heightWidget.value,
            });
            handleHeightChange(value);
          }
        );

        // 监听 size widget 的变化，当切换到 Custom 时，重新验证宽高
        if (sizeWidget) {
          const originalSizeCallback = sizeWidget.callback;
          sizeWidget.callback = chainCallback(
            originalSizeCallback,
            function (value) {
              if (value === "Custom") {
                const currentWidth = Number(widthWidget.value) || 2048;
                const currentHeight = Number(heightWidget.value) || 2048;
                const adjusted = validateAndAdjustDimensions(
                  currentWidth,
                  currentHeight
                );

                if (
                  Math.abs(adjusted.width - currentWidth) > 0.5 ||
                  Math.abs(adjusted.height - currentHeight) > 0.5
                ) {
                  isUpdating = true;
                  try {
                    widthWidget.value = adjusted.width;
                    heightWidget.value = adjusted.height;
                    if (currentWidthCallback) {
                      currentWidthCallback.call(widthWidget, adjusted.width);
                    }
                    if (currentHeightCallback) {
                      currentHeightCallback.call(heightWidget, adjusted.height);
                    }
                    if (node && node.setDirtyCanvas) {
                      node.setDirtyCanvas(true, true);
                    }
                  } finally {
                    isUpdating = false;
                  }
                }
              }
            }
          );
        }
      } catch (error) {
        console.error("[Seedream4.5] 初始化宽高比联动失败:", error);
      }
    }, 200); // 增加延迟，确保ComfyUI的setupNodeWidgetCallbacks已经执行
  },
});
