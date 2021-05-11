const defaults = {
  size: 3,
  speed: 2500,
  angle: 0,
  pitch: 250,
  volume: 0,
  wave: 0,
  length: 50,
  background: 1,
  opacity: 1,
  lightbar: 0,
  steps: 1,
  color: 'white',
  shape: 'circle',
  panel: 'appearance',
  playing: false,
  mini: false,
};

const limits = {
  wave: { min: 0, max: 25, amplitude: 2.5 },
  angle: { min: -45, max: 45 },
  length: { min: 10, max: 50 },
  speed: { min: 250, max: 3000, nudge: 10 },
  volume: { min: 0, max: 4000, nudge: 50 },
  pitch: { min: 50, max: 2000 },
  steps: { min: 1, max: 8 },
  lightbar: { min: 0, max: 0.5, step: 0.05 },
  background: { min: 0, max: 1, step: 0.05 },
  opacity: { min: 0, max: 1, step: 0.01 },
  size: { min: 1, max: 15, step: 0.1 },
  miniSize: 300,
  audioPanRange: 10000,
  toolbarHideDelay: 3000,
};

export { defaults, limits };
