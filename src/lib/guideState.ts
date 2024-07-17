import { MouseEvent } from "react";
import { create } from "zustand";
import { User, defaults, limits, updateGuide, update, consoleLog, objDiff } from ".";

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
  trigger: null | string;
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
  trigger: null,

  setSetting: (setting, value) => update(set, (state) => {
    state.settings[setting] = value;
    state.trigger = "setSetting";
  }),

   setActiveSetting: (setting) => update(set, (state) => {
    state.activeSetting = setting;
    state.motionBarActive = !!setting.match(/angle|length/);
    state.trigger = "setActiveSetting";
  }),

  volumeDown: () => update(set, ({ settings }) => { settings.volume = Math.max(settings.volume - volume.nudge, volume.min) }),
  volumeUp: () => update(set, ({ settings }) => { settings.volume = Math.min(settings.volume + volume.nudge, volume.max) }),

  speedUp: () => update(set, ({ settings }) => { settings.speed = Math.min(settings.speed + speed.nudge, speed.max) }),
  speedDown: () => update(set, ({ settings }) => { settings.speed = Math.max(settings.speed - speed.nudge, speed.min) }),

  setUser: (user) => update(set, (State) => {
    State.user = user;
    State.trigger = "setUser";
  }),
  setUserMode: (userMode: boolean | MouseEvent<HTMLButtonElement>) => update(set, (state) => {
    if (typeof userMode === "boolean") {
      state.userMode = userMode;
      updateGuide("userMode", state.userMode);
    } else if (userMode && userMode?.type === "click") {
      state.userMode = !state.userMode;
      updateGuide("userMode", state.userMode);
    }
    state.trigger = "setUserMode";
  }),
  setClientLink: (link) => update(set, (state) => {
    state.clientLink = link;
    state.trigger = "setClientLink";
  }),
  setClientStatus: (status) => update(set, (state) => {
    state.clientStatus = status;
    state.trigger = "setClientStatus";
  }),
  setClientName: (name) => update(set, (state) => {
    state.clientName = name;
    state.trigger = "setClientName";
    updateGuide("clientName", name);
  }),
  setPresets: (presets) => update(set, (state) => {
    state.presets = presets;
    state.trigger = "setPresets";
  }),
  setActivePreset: (activeSetting) => update(set, (state) => {
    state.activePreset = activeSetting;
    state.trigger = "setActivePreset";
  }),
}));

useGuideState.subscribe(({ trigger, user, ...state }, {user: j1 ,trigger: j2, ...preState}) => {
  if (trigger === "setSetting") {
    return;
  }
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "info" );
  }
});
