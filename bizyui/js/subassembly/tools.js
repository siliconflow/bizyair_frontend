export const hideWidget = (node, widget_name) => {
  const widget = node.widgets.find(widget => widget.name === widget_name)
  if (!widget) {
    return
  }

  const originalComputeSize = widget.computeSize;
  const originalType = widget.type;

  widget.computeSize = () => [0, -4];
  widget.type = "hidden";
  widget.hidden=true
  widget.options = widget.options || {};
  widget.show = () => {
    widget.computeSize = originalComputeSize;
    widget.type = originalType;
    widget.height = undefined;
  };
}

export function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key === name) {
      return valueParts.join('=');
    }
  }
  return null;
}

let isServerMode = null
export async function getIsServerMode() {
  if (isServerMode === null) {
    const serverModeResponse = await fetch("/bizyair/server_mode");
    const serverModeData = await serverModeResponse.json();
    isServerMode = serverModeData.data.server_mode
  }
  return isServerMode
}