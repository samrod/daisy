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
  gain: number,
  duration: number,
  reverb: number,
  panCenter: boolean,
  now: number
): { dryGain?: GainNode; wetGain?: GainNode } => {
  let dryGain: GainNode | undefined;
  let wetGain: GainNode | undefined;

  dryGain = ctx.createGain();
  stereoPanner.connect(dryGain);
  applyEnvelope(dryGain, now, gain, duration);

  if (reverb > 0) {
    const convolver = ctx.createConvolver();
    convolver.buffer = impulseResponse(ctx, reverb, panCenter);

    wetGain = ctx.createGain();
    wetGain.gain.value = gain;

    stereoPanner.connect(convolver);
    convolver.connect(wetGain);
  }
  return { dryGain, wetGain };
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
  const { dryGain, wetGain } = createDryWetRouting(
    ctx,
    stereoPanner,
    gain,
    duration,
    reverb,
    panX === 0,
    now
  );

  if (dryGain) dryGain.connect(ctx.destination);
  if (wetGain) wetGain.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration / 1000);
};

const impulseCache: Record<string, AudioBuffer> = {};
const impulseResponse = (ctx: AudioContext, duration = 0.5, reverse = false): AudioBuffer => {
  const key = `${duration.toFixed(3)}:${reverse ? 1 : 0}`;
  if (impulseCache[key]) return impulseCache[key];

  const sampleRate = ctx.sampleRate;
  const paddedDuration = Math.max(duration, 0.5); // minimum tail buffer
  const length = Math.floor(sampleRate * paddedDuration);

  const impulse = ctx.createBuffer(2, length, sampleRate);
  const l = impulse.getChannelData(0);
  const r = impulse.getChannelData(1);

  const decay = Math.max(1, -Math.log(0.0001) / duration); // use real duration to decay fast or slow

  for (let i = 0; i < length; i++) {
    const n = reverse ? length - i : i;
    const env = Math.pow(1 - n / length, decay);
    const shaped = Math.sqrt(env);
    const noise = (Math.random() * 2 - 1) * shaped;

    l[i] = noise;
    r[i] = noise;
  }

  impulseCache[key] = impulse;
  return impulse;
};
