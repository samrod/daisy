import { create } from "zustand";
import { defaults, limits } from "./constants";
import { produce } from "immer";

export type StateType = {
  userMode: boolean;
  motionBarActive: boolean;
  activeSetting: string;
  settings: typeof defaults;
}

export type ActionsType = {
  setSettings: (setting: string, value: string | number | boolean) => void;
  togglePlay: () => void;
  toggleUserMode: () => void;
  volumeUp: () => void;
  volumeDown: () => void;
  speedUp: () => void;
  speedDown: () => void;
  flashBar: (setting: string) => void;
  hideBar: () => void;
}

const update = (set, func: (state: StateType) => void) => set(produce(func));
const { volume, speed } = limits;

export const useStore = create<StateType & ActionsType>((set) => ({
  userMode: false,
  settings: defaults,
  motionBarActive: false,
  activeSetting: "",

  setSettings: (setting, value) => update(set, ({ settings }) => { settings[setting] = value }),
  toggleUserMode: () => update(set, (State) => { State.userMode = !State.userMode }),
  togglePlay: () => update(set, ({ settings }) => { settings.playing = !settings.playing }),

  flashBar: (setting) => update(set, (State) => { State.motionBarActive = true; State.activeSetting = setting }),
  hideBar: () => update(set, (State) => { State.motionBarActive = false; State.activeSetting = "" }),

  volumeDown: () => update(set, ({ settings }) => { settings.volume = Math.max(settings.volume - volume.nudge, volume.min) }),
  volumeUp: () => update(set, ({ settings }) => { settings.volume = Math.min(settings.volume + volume.nudge, volume.max) }),

  speedUp: () => update(set, ({ settings }) => { settings.speed = Math.min(settings.speed + speed.nudge, speed.max) }),
  speedDown: () => update(set, ({ settings }) => { settings.speed = Math.max(settings.speed - speed.nudge, speed.min) }),
}));
