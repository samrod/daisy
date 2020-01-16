const defaults = {
  size: 7.5,
  speed: 1000,
  angle: 0,
  pitch: 1000,
  volume: 1500,
  wave: 0,
  length: 50,
  background: 1,
  opacity: 1,
  color: 'white',
};

const limits = {
  minSpeed: 250,
  maxSpeed: 3000,
  minVolume: 0,
  maxVolume: 4000,
  speedAdjustIncrement: 10,
  volumeAdjustIncrement: 50,
};

export { defaults, limits };
