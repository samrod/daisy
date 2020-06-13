export function unbindEvent({ element, event, handler }) {
  element.removeEventListener(event, handler);
}

export function bindEvent({ element, event, handler }) {
  element.addEventListener(event, handler);
}

export function receiveMessage({ data, ...e }) {
  const { action, params } = JSON.parse(data);
  if (this[action]) {
    // console.log(window.location.pathname, data);
    this[action].call(this, params);
  } else {
    console.warn(`${action} is not available.`);
  }
};

export const sendMessage = (data, displays = [window.opener || window.parent], target = window.location.href) => {
  const message = JSON.stringify(data);
  displays.forEach(display => {
    display && display.postMessage(message, target);
  });
};

