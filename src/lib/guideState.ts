import { create } from "zustand";
import { User } from "firebase/auth";

import { defaults, limits } from "./constants";
import { updateUser } from "./store";
import { update } from "./utils";

const { volume, speed } = limits;

export type StateTypes = {
  userMode: boolean;
  user?: User;
  motionBarActive: boolean;
  activeSetting: string;
  activePreset: string;
  clientLink: string;
  clientStatus: number;
  clientName: string;
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
  setActiveSetting: (setting: string) => void;
  setPresets: (preset: object) => void;
  setUser: (user: User) => void;
  setUserMode: (userMode: boolean) => void;
  setClientLink: (link: string) => void;
  setClientStatus: (state: number) => void;
  setClientName: (name: string) => void;
};

export const useGuideState = create<StateTypes & ActionsTypes>((set) => ({
  userMode: false,
  user: null,
  settings: defaults,
  motionBarActive: false,
  activeSetting: "",
  activePreset: "",
  clientLink: "",
  clientStatus: 0,
  clientName: "",
  presets: {},

  setSetting: (setting, value) => update(set, ({ settings, clientLink }) => {
    settings[setting] = value;
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
  setClientLink: (link) => update(set, (State) => {
    State.clientLink = link;
  }),
  setClientStatus: (status) => update(set, (State) => {
    State.clientStatus = status;
  }),
  setClientName: (name) => update(set, (State) => {
    State.clientName = name;
    updateUser("clientName", name);
  }),
  setPresets: (presets) => update(set, (State) => { State.presets = presets }),
  setActivePreset: (activeSetting) => update(set, (State) => { State.activePreset = activeSetting }),
}));
