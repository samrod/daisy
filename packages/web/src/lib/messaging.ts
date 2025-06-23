export function receiveMessage({ data, ...e }) {
  let parsedData: { action: string, params: unknown } | string;
  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    if (typeof parsedData === "string" && !parsedData.includes("webpack")) {
      console.warn(`*** received invalid data at "${window.self.location.pathname}":\n`, data, typeof data);
    }
    return;
  }
  if (typeof parsedData !== "string") {
    const { action, params } = parsedData;
    if (this[action]) {
      // console.log("*** receiveMessage:", window.name, action, data);
      this[action].call(this, params);
    } else {
      console.warn(`*** receivedMessage "${action}" is not available at ${window.self.location.pathname}`);
    }
  }
};

export const sendMessage = (
  data: { action: string, params?: unknown },
  windows: Window[] = [window.opener || window.parent],
  targetOrigin: string = window.location.href
) => {
  if (!data) {
    console.warn("*** sendMessage is missing data: ", data, typeof data);
    return;
  }
  const message = JSON.stringify(data);
  windows.filter(n=>n).forEach(window => {
    Promise.resolve(setTimeout(
      () => {
        // console.log("*** sendMessage from ", window.self.location.pathname, data);
        window.postMessage(message, targetOrigin);
      }
    ))
  });
};

