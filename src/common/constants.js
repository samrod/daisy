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
  minSpeed: 250,
  maxSpeed: 3000,
  minVolume: 0,
  maxVolume: 4000,
  waveAmplitude: 2.5,
  speedAdjustIncrement: 10,
  volumeAdjustIncrement: 50,
  miniSize: 300,
};

export { defaults, limits };
