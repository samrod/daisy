export function bindEvent({ selector, event = 'click', handler }) {
  document.querySelectorAll(selector).forEach(item => item.addEventListener(event, this[handler]));
}

export function receiveMessage({ data }) {
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

