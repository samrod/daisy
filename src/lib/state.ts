import { create } from "zustand";
import { DEFAULT_PRESET_NAME, defaults, limits } from "./constants";
import { produce } from "immer";
import { User } from "firebase/auth";
import { sendMessage } from "./utils";
import { updateSetting, updateUser } from "./store";

export type StateTypes = {
  userMode: boolean;
  user?: User;
  motionBarActive: boolean;
  activeSetting: string;
  activePreset: string;
  settings: typeof defaults;
  presets: {};
}

export type ActionsTypes = {
  setSetting: (setting: string, value: string | number | boolean) => void;
  volumeUp: () => void;
  volumeDown: () => void;
  speedUp: () => void;
  speedDown: () => void;
  setActivePreset: (setting: string) => void;
  setPresets: (preset: object) => void;
  setUser: (user: User) => void;
  setUserMode: (userMode: boolean) => void;
};

const update = (set, func: (state: StateTypes) => void) => set(produce(func));
const { volume, speed } = limits;

export const useStore = create<StateTypes & ActionsTypes>((set) => ({
  userMode: false,
  user: null,
  settings: defaults,
  motionBarActive: false,
  activeSetting: "",
  activePreset: "",
  presets: {},

  setSetting: (setting, value) => update(set, ({ settings }) => {
    if (settings[setting] !== value) {
      // console.log(`*** ${document.location.pathname} setSetting`, settings[setting], setting, value);
      settings[setting] = value;
      updateSetting(setting, value);
    }
  }),

   setActiveSetting: (setting) => update(set, (State) => {
    State.activeSetting = setting;
    State.motionBarActive = !!setting.match(/angle|length/);
  }),

  volumeDown: () => update(set, ({ settings }) => { settings.volume = Math.max(settings.volume - volume.nudge, volume.min) }),
  volumeUp: () => update(set, ({ settings }) => { settings.volume = Math.min(settings.volume + volume.nudge, volume.max) }),

  speedUp: () => update(set, ({ settings }) => { settings.speed = Math.min(settings.speed + speed.nudge, speed.max) }),
  speedDown: () => update(set, ({ settings }) => { settings.speed = Math.max(settings.speed - speed.nudge, speed.min) }),

  setUser: (user) => update(set, (State) => { State.user = user }),
  setUserMode: (userMode) => update(set, (State) => {
    if (typeof userMode === "boolean") {
      State.userMode = userMode;
    } else {
      State.userMode = !State.userMode;
      updateUser("userMode", State.userMode);
    }
  }),
  setPresets: (presets) => update(set, (State) => { State.presets = presets }),
  setActivePreset: (activeSetting) => update(set, (State) => { State.activePreset = activeSetting }),
}));
