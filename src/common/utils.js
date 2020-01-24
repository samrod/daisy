export function unbindEvent({ element, event, handler }) {
  element.removeEventListener(event, handler);
}

export function bindEvent({ element, event, handler }) {
  element.addEventListener(event, handler);
}

export function receiveMessage({ data, ...e }) {
  const { action, params } = JSON.parse(data);
  if (this[action]) {
    this[action].call(this, params);
  } else {
    console.warn(`${action} is not available.`);
  }
};

export const sendMessage = (data, target = window.location.href, display = window.opener || window.parent) => {
  const message = JSON.stringify(data);
  display.postMessage(message, target);
};

