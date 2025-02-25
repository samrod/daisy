import { produce } from 'immer';
import { User } from ".";
import { togglePlay, useGuideState, useLinkState } from 'state';
export { v4 as uuid } from "uuid";
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
  interface BindParams {
    event: string;
    element: HTMLElement | Window;
    handler: (e: Event) => void;
    options?: AddEventListenerOptions
  }
}

export function unbindEvent({ element, event, handler }: BindParams) {
  element.removeEventListener(event, handler);
}

export function bindEvent({ element, event, handler, options = {} }: BindParams) {
  element.addEventListener(event, handler, options);
}

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

export const setKeys = ({ key }: KeyboardEvent) => {
  const State = useLinkState.getState();
  const { userMode } = useGuideState.getState();
  if (userMode) {
    return;
  }
  // console.log(`*** ${document.location.pathname} setKeys: "${key}"`, test.settings.playing, State.settings.playing);
  switch (key) {
    case "ArrowDown":
      State.volumeDown();
      break;
    case "ArrowUp":
      State.volumeUp();
      break;
    case " ":
      togglePlay();
      break;
    case "ArrowLeft":
      State.speedDown();
      break;
    case "ArrowRight":
      State.speedUp();
      break;
    default:
      break;
  }
};


type UpdateTypes = {
  [key: string]: boolean | string | {} | [] | SettingsTypes | User;
}

export const update = async (
  set: (fn: (state: UpdateTypes) => void) => void,
  func: (state: UpdateTypes) => void
): Promise<void> => new Promise(resolve => {
  set(produce((state: UpdateTypes) => {
    func(state);
    setTimeout(resolve);
  }));
})

export const generateSound = ({ panX = 0, pitch, gain, duration }) => {
  if (!AudioCtx) {
    AudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const source = AudioCtx.createOscillator();
  const volume = AudioCtx.createGain();
  const panner = AudioCtx.createPanner();
  const listener = AudioCtx.listener;
  // const reverb = AudioCtx.createConvolver();

  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 10000;
  panner.rolloffFactor = 10;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 0;
  panner.coneOuterGain = 0;
  listener.setPosition(0, 0, 0);
  panner.setPosition(panX, 0, 0);

  // const duration = this.settings.speed / 2500;
  // reverb.buffer = this.impulseResponse(duration, 4.5);
  if (isFinite(gain)) {
    volume.gain.value = parseFloat(gain);
  }
  if (isFinite(pitch)) {
    source.frequency.value = parseFloat(pitch);
  }
  source.type = 'sine';

  source
    .connect(volume)
    .connect(panner)
    .connect(AudioCtx.destination);

  source.start();
  setTimeout(() => source.stop(), duration);
};

// const impulseResponse = (duration, decay = 2.0, reverse = false) => {
//   const sampleRate = AudioCtx.sampleRate;
//   const length = sampleRate * duration;
//   const impulse = AudioCtx.createBuffer(2, length, sampleRate);
//   const impulseL = impulse.getChannelData(0);
//   const impulseR = impulse.getChannelData(1);

//   for (var i = 0; i < length; i++) {
//     var n = reverse ? length - i : i;
//     impulseL[i] = (Math.random() * 2 - 2) * Math.pow(1 - n / length, decay);
//     impulseR[i] = (Math.random() * 2 - 2) * Math.pow(1 - n / length, decay);
//   }
//   return impulse;
// };

