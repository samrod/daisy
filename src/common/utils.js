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

const AudioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const generateSound = ({ panX = 0, pitch, gain, duration }) => {
  const source = AudioCtx.createOscillator();
  const volume = AudioCtx.createGain();
  const panner = AudioCtx.createPanner();
  // const reverb = AudioCtx.createConvolver();

  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 1;
  panner.rolloffFactor = 1;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 0;
  panner.coneOuterGain = 0;
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

  source.connect(volume);
  volume.connect(panner);
  panner.connect(AudioCtx.destination);

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

