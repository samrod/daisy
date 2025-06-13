interface GenerateSoundProps {
  panX?: number;
  pitch: number;
  gain: number;
  duration: number;
  reverb?: number;
}

const getAudioContext = () => {
  if (!window["AudioCtx"]) {
    window["AudioCtx"] = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window["AudioCtx"];
};

const createOscillator = (
  ctx: AudioContext,
  pitch: number,
  panX = 0
): {
  source: OscillatorNode,
  stereoPanner: StereoPannerNode
} => {
  const source = ctx.createOscillator();
  const stereoPanner = ctx.createStereoPanner();
  source.frequency.value = pitch;
  source.type = 'sine';
  stereoPanner.pan.value = Math.max(-1, Math.min(1, panX));
  source.connect(stereoPanner);
  return { source, stereoPanner };
};

const applyEnvelope = (
  gainNode: GainNode,
  now: number,
  gain: number,
  duration: number,
) => {
  const attack = 0.01;
  const release = 0.03;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(gain, now + attack);
  gainNode.gain.setValueAtTime(gain, now + duration / 1000 - release);
  gainNode.gain.linearRampToValueAtTime(0.0001, now + duration / 1000);
};

const createDryWetRouting = (
  ctx: AudioContext,
  stereoPanner: StereoPannerNode,
  reverb = 0,
  panCenter = false
): {
  dryVolume: GainNode,
  wetVolume: GainNode,
} => {
  const dryVolume = ctx.createGain();
  const wetVolume = ctx.createGain();

  if (reverb > 0) {
    const convolver = ctx.createConvolver();
    convolver.buffer = impulseResponse(ctx, reverb, panCenter);

    const dry = ctx.createGain();
    const wet = ctx.createGain();
    dry.gain.value = 1 - reverb;
    wet.gain.value = reverb;

    stereoPanner.connect(dry);
    stereoPanner.connect(convolver);
    convolver.connect(wet);

    dry.connect(dryVolume);
    wet.connect(wetVolume);
  } else {
    stereoPanner.connect(dryVolume);
  }

  return { dryVolume, wetVolume };
};

export const generateSound = async ({
  panX = 0,
  pitch = 440,
  gain = 0.5,
  duration = 500,
  reverb = 0,
}: GenerateSoundProps) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  const now = ctx.currentTime;
  const { source, stereoPanner } = createOscillator(ctx, pitch, panX);
  const { dryVolume, wetVolume } = createDryWetRouting(ctx, stereoPanner, reverb, panX === 0);

  applyEnvelope(dryVolume, now, gain, duration);
  dryVolume.connect(ctx.destination);
  if (reverb > 0) wetVolume.connect(ctx.destination);

  source.start();
  source.stop(now + duration / 1000 + 0.01);
};

const impulseCache: Record<string, AudioBuffer> = {};
const impulseResponse = (ctx: AudioContext, duration = 0.5, reverse = false) => {
  const key = `${duration.toFixed(3)}:${reverse ? 1 : 0}`;
  if (impulseCache[key]) return impulseCache[key];

  const decay = -Math.log(0.01) / duration;
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const l = impulse.getChannelData(0);
  const r = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = reverse ? length - i : i;
    const envelope = Math.pow(1 - n / length, decay);
    const noise = (Math.random() * 2 - 1) * envelope;
    l[i] = noise;
    r[i] = noise * 0.9 + (Math.random() * 0.2 - 0.1);
  }

  impulseCache[key] = impulse;
  return impulse;
};
