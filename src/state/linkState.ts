import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { defaults, limits, update, consoleLog, objDiff } from "lib";

const { volume, speed } = limits;

export type LinkStateTypes = {
  settings: null | SettingsTypes;
  clientLink: string | null;
  clientStatus: number;
  clientName: string;
  preset: string;
  presetName: string;
  motionBarActive: boolean;
  activeSetting: string;
  trigger: null | string;
}

export type LinkActionsTypes = {
  setSetting: (setting: string, value: string | number | boolean) => void;
  volumeUp: () => void;
  volumeDown: () => void;
  speedUp: () => void;
  speedDown: () => void;
  setClientLink: (state: string) => void;
  setPreset: (state: string) => void;
  setPresetName: (name: string) => void;
  setActiveSetting: (setting: string) => void;
};

const linkStates: LinkStateTypes = {
  settings: defaults,
  motionBarActive: false,
  activeSetting: "",
  clientLink: null,
  clientStatus: 0,
  clientName: "",
  preset: "",
  presetName: "",
  trigger: null,
};

const linkActions = (set): LinkActionsTypes => ({
  setSetting: async (setting, value) => await update(set, (state) => {
    state.settings[setting] = value;
    state.trigger = "setSetting";
  }),
  setActiveSetting: async (setting) => await update(set, (state) => {
    state.activeSetting = setting;
    state.motionBarActive = !!setting.match(/angle|length/);
    state.trigger = "setActiveSetting";
  }),
  volumeDown: async () => await update(set, ({ settings }) => { 
    if (typeof settings === 'object' && settings !== null && 'volume' in settings) {
      settings.volume = Math.max(settings.volume - volume.nudge, volume.min);
    }
  }),
  volumeUp: async () => await update(set, ({ settings }) => {
    if (typeof settings === 'object' && settings !== null && 'volume' in settings) {
      settings.volume = Math.min(settings.volume + volume.nudge, volume.max);
    }
  }),
  speedUp: async () => await update(set, ({ settings }) => { 
    if (typeof settings === 'object' && settings !== null && 'speed' in settings) {
      settings.speed = Math.min(settings.speed + speed.nudge, speed.max);
    }
  }),
  speedDown: async () => await update(set, ({ settings }) => {
    if (typeof settings === 'object' && settings !== null && 'speed' in settings) {
      settings.speed = Math.max(settings.speed - speed.nudge, speed.min);
    }
  }),
  setClientLink: async (link) => await update(set, (state) => {
    state.clientLink = link;
    state.trigger = "setClientLink";
  }),
  setPreset: async (preset) => await update(set, (state) => {
    state.preset = preset;
    state.trigger = "setPreset";
  }),
  setPresetName: async (name) => await update(set, (state) => {
    state.presetName = name;
    state.trigger = "setPresetNae";
  }),
});

export const useLinkState = create<LinkStateTypes & LinkActionsTypes>()(
  devtools((set) => ({
    ...linkStates,
    ...linkActions(set),
  }))
);

useLinkState.subscribe(({ trigger, ...state }, {trigger: j2, ...preState}) => {
  if (trigger === "setSetting") {
    return;
  }
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "#0CC" );
  }
});
