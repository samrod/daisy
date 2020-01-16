export function bindEvent({ selector, event = 'click', handler }) {
  document.querySelectorAll(selector).forEach(item => item.addEventListener(event, this[handler]));
}

export function receiveMessage({ data }) {
  const { action, params } = JSON.parse(data);
  if (this[action]) {
    this[action](params);
  } else {
    console.warn(`${action} is not available.`);
  }
};

export const sendMessage = data => {
  const message = JSON.stringify(data);
  const display = window.opener || window.parent;
  display.postMessage(message, window.location.href);
};

